from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random

from database import get_db, init_db
from models import User, Interest, Activity, Swipe, Match, Message
from schemas import (
    UserCreate, UserUpdate, UserResponse, UserProfile,
    InterestCreate, InterestResponse,
    ActivityCreate, ActivityResponse,
    LoginRequest, Token,
    SwipeCreate, SwipeResponse,
    MatchResponse, MessageCreate, MessageResponse,
    DiscoveryFilters
)
from auth import get_password_hash, verify_password, create_access_token, get_current_active_user
from matching import get_discovery_candidates, check_mutual_like, create_match, calculate_compatibility

app = FastAPI(title="WarmConnect Dating API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://warmconnect-web.onrender.com",
        "https://*.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== SEED DATA ==========
@app.on_event("startup")
def startup_event():
    init_db()
    db = next(get_db())
    seed_data(db)

def seed_data(db: Session):
    """Seed initial interests and activities if none exist."""
    if db.query(Interest).first():
        return

    interests = [
        Interest(name="Photography", category="arts", icon="camera"),
        Interest(name="Cooking", category="lifestyle", icon="utensils"),
        Interest(name="Hiking", category="outdoor", icon="mountain"),
        Interest(name="Reading", category="intellectual", icon="book"),
        Interest(name="Gaming", category="entertainment", icon="gamepad"),
        Interest(name="Yoga", category="wellness", icon="heart"),
        Interest(name="Travel", category="lifestyle", icon="plane"),
        Interest(name="Music", category="arts", icon="music"),
        Interest(name="Movies", category="entertainment", icon="film"),
        Interest(name="Fitness", category="wellness", icon="dumbbell"),
        Interest(name="Art", category="arts", icon="palette"),
        Interest(name="Technology", category="intellectual", icon="cpu"),
        Interest(name="Dancing", category="arts", icon="music"),
        Interest(name="Gardening", category="outdoor", icon="leaf"),
        Interest(name="Writing", category="arts", icon="pen-tool"),
    ]

    activities = [
        Activity(name="Coffee Dates", category="social", description="Casual meetups at cozy cafes", icon="coffee"),
        Activity(name="Hiking Trails", category="outdoor", description="Explore nature together", icon="mountain"),
        Activity(name="Board Game Nights", category="indoor", description="Fun evenings with games", icon="grid"),
        Activity(name="Cooking Together", category="indoor", description="Prepare meals as a team", icon="chef-hat"),
        Activity(name="Concert Going", category="social", description="Live music experiences", icon="mic"),
        Activity(name="Beach Days", category="outdoor", description="Relax by the ocean", icon="sun"),
        Activity(name="Museum Visits", category="indoor", description="Explore art and history", icon="building"),
        Activity(name="Movie Nights", category="indoor", description="Watch films together", icon="tv"),
        Activity(name="Fitness Classes", category="indoor", description="Work out together", icon="activity"),
        Activity(name="Wine Tasting", category="social", description="Discover new wines", icon="wine"),
        Activity(name="Photography Walks", category="outdoor", description="Capture moments together", icon="camera"),
        Activity(name="Volunteering", category="social", description="Give back to community", icon="heart"),
    ]

    for i in interests:
        db.add(i)
    for a in activities:
        db.add(a)

    db.commit()

    # Seed demo users
    demo_users = [
        {"email": "demo1@warmconnect.com", "name": "Emma", "age": 26, "gender": "female", "lat": 40.7128, "lon": -74.0060},
        {"email": "demo2@warmconnect.com", "name": "James", "age": 28, "gender": "male", "lat": 40.7580, "lon": -73.9855},
        {"email": "demo3@warmconnect.com", "name": "Sofia", "age": 24, "gender": "female", "lat": 40.7282, "lon": -73.7949},
        {"email": "demo4@warmconnect.com", "name": "Michael", "age": 30, "gender": "male", "lat": 40.6892, "lon": -74.0445},
        {"email": "demo5@warmconnect.com", "name": "Ava", "age": 27, "gender": "female", "lat": 40.7489, "lon": -73.9680},
        {"email": "demo6@warmconnect.com", "name": "Daniel", "age": 25, "gender": "male", "lat": 40.7614, "lon": -73.9776},
    ]

    all_interests = db.query(Interest).all()
    all_activities = db.query(Activity).all()

    bios = [
        "Coffee enthusiast and weekend hiker. Looking for someone to explore the city with!",
        "Software engineer by day, amateur chef by night. Let's cook something amazing together.",
        "Yoga lover and bookworm. Seeking meaningful connections and deep conversations.",
        "Photography addict who loves capturing sunsets. Always up for an adventure!",
        "Music is my therapy. Looking for a concert buddy and maybe something more.",
        "Fitness fanatic with a soft spot for board games. Let's find balance together.",
    ]

    avatars = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    ]

    for idx, du in enumerate(demo_users):
        user = User(
            email=du["email"],
            hashed_password=get_password_hash("demo123"),
            full_name=du["name"],
            age=du["age"],
            gender=du["gender"],
            bio=bios[idx],
            location="New York, NY",
            latitude=du["lat"],
            longitude=du["lon"],
            avatar_url=avatars[idx],
        )
        user.set_photos([avatars[idx]])
        # Random interests and activities
        user.interests = random.sample(all_interests, k=random.randint(3, 6))
        user.activities = random.sample(all_activities, k=random.randint(2, 4))
        db.add(user)

    db.commit()

# ========== AUTH ROUTES ==========
@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        age=user_data.age,
        gender=user_data.gender,
        looking_for=user_data.looking_for,
        bio=user_data.bio,
        occupation=user_data.occupation,
        location=user_data.location,
        latitude=user_data.latitude,
        longitude=user_data.longitude,
        min_age=user_data.min_age,
        max_age=user_data.max_age,
        max_distance_km=user_data.max_distance_km,
    )

    if user_data.interest_ids:
        interests = db.query(Interest).filter(Interest.id.in_(user_data.interest_ids)).all()
        user.interests = interests
    if user_data.activity_ids:
        activities = db.query(Activity).filter(Activity.id.in_(user_data.activity_ids)).all()
        user.activities = activities

    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.post("/api/auth/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# ========== USER ROUTES ==========
@app.get("/api/users/{user_id}", response_model=UserProfile)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    score, shared_interests, shared_activities = calculate_compatibility(current_user, user)
    distance = None
    if current_user.latitude and user.latitude:
        from matching import calculate_distance_km
        distance = calculate_distance_km(current_user.latitude, current_user.longitude, user.latitude, user.longitude)

    result = UserProfile.from_orm(user)
    result.compatibility_score = score
    result.distance_km = round(distance, 1) if distance else None
    result.shared_interests = shared_interests
    result.shared_activities = shared_activities
    return result

@app.put("/api/users/me", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    for field, value in update_data.dict(exclude_unset=True).items():
        if field == "interest_ids":
            interests = db.query(Interest).filter(Interest.id.in_(value)).all()
            current_user.interests = interests
        elif field == "activity_ids":
            activities = db.query(Activity).filter(Activity.id.in_(value)).all()
            current_user.activities = activities
        elif field == "profile_photos":
            current_user.set_photos(value)
        else:
            setattr(current_user, field, value)

    current_user.last_active = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user

# ========== INTEREST & ACTIVITY ROUTES ==========
@app.get("/api/interests", response_model=List[InterestResponse])
def get_interests(db: Session = Depends(get_db)):
    return db.query(Interest).all()

@app.get("/api/activities", response_model=List[ActivityResponse])
def get_activities(db: Session = Depends(get_db)):
    return db.query(Activity).all()

# ========== DISCOVERY ROUTES ==========
@app.get("/api/discover", response_model=List[UserProfile])
def discover(
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    max_distance_km: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    interest_ids: Optional[str] = Query(None),
    activity_ids: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    i_ids = [int(x) for x in interest_ids.split(",")] if interest_ids else None
    a_ids = [int(x) for x in activity_ids.split(",")] if activity_ids else None

    candidates = get_discovery_candidates(
        db, current_user, limit=limit,
        min_age=min_age, max_age=max_age,
        max_distance_km=max_distance_km,
        gender=gender,
        interest_ids=i_ids,
        activity_ids=a_ids
    )

    results = []
    for user, score, shared_interests, shared_activities, distance in candidates:
        profile = UserProfile.from_orm(user)
        profile.compatibility_score = score
        profile.distance_km = round(distance, 1)
        profile.shared_interests = shared_interests
        profile.shared_activities = shared_activities
        results.append(profile)

    return results

# ========== SWIPE ROUTES ==========
@app.post("/api/swipes", response_model=SwipeResponse)
def create_swipe(
    swipe_data: SwipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if swipe_data.swiped_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot swipe on yourself")

    # Check if already swiped
    existing = db.query(Swipe).filter(
        Swipe.swiper_id == current_user.id,
        Swipe.swiped_id == swipe_data.swiped_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already swiped on this user")

    swipe = Swipe(
        swiper_id=current_user.id,
        swiped_id=swipe_data.swiped_id,
        direction=swipe_data.direction
    )
    db.add(swipe)
    db.commit()
    db.refresh(swipe)

    is_match = False
    if swipe_data.direction == "right":
        is_match = check_mutual_like(db, current_user.id, swipe_data.swiped_id)
        if is_match:
            create_match(db, current_user.id, swipe_data.swiped_id)

    return {
        "id": swipe.id,
        "swiper_id": swipe.swiper_id,
        "swiped_id": swipe.swiped_id,
        "direction": swipe.direction,
        "is_match": is_match,
        "created_at": swipe.created_at
    }

# ========== MATCH ROUTES ==========
@app.get("/api/matches", response_model=List[MatchResponse])
def get_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    matches = []

    for m in current_user.matches_as_user1 + current_user.matches_as_user2:
        if not m.is_active:
            continue

        other_user = m.user2 if m.user1_id == current_user.id else m.user1

        last_msg = m.messages[-1] if m.messages else None
        unread = len([msg for msg in m.messages if msg.sender_id != current_user.id and not msg.is_read])

        match_data = MatchResponse(
            id=m.id,
            user=UserResponse.from_orm(other_user),
            compatibility_score=m.compatibility_score,
            last_message=last_msg.content if last_msg else None,
            last_message_at=last_msg.created_at if last_msg else None,
            unread_count=unread,
            created_at=m.created_at
        )
        matches.append(match_data)

    matches.sort(key=lambda x: x.last_message_at or x.created_at, reverse=True)
    return matches

@app.delete("/api/matches/{match_id}")
def unmatch(match_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match or (match.user1_id != current_user.id and match.user2_id != current_user.id):
        raise HTTPException(status_code=404, detail="Match not found")

    match.is_active = False
    db.commit()
    return {"message": "Unmatched successfully"}

# ========== MESSAGE ROUTES ==========
@app.get("/api/matches/{match_id}/messages", response_model=List[MessageResponse])
def get_messages(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match or (match.user1_id != current_user.id and match.user2_id != current_user.id):
        raise HTTPException(status_code=404, detail="Match not found")

    # Mark messages as read
    for msg in match.messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()

    return [
        MessageResponse(
            id=msg.id,
            match_id=msg.match_id,
            sender_id=msg.sender_id,
            sender_name=msg.sender.full_name,
            sender_avatar=msg.sender.avatar_url,
            content=msg.content,
            is_read=msg.is_read,
            created_at=msg.created_at
        )
        for msg in match.messages
    ]

@app.post("/api/messages", response_model=MessageResponse)
def send_message(
    msg_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    match = db.query(Match).filter(Match.id == msg_data.match_id).first()
    if not match or (match.user1_id != current_user.id and match.user2_id != current_user.id):
        raise HTTPException(status_code=404, detail="Match not found")

    if not match.is_active:
        raise HTTPException(status_code=400, detail="Match is no longer active")

    message = Message(
        match_id=msg_data.match_id,
        sender_id=current_user.id,
        content=msg_data.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return MessageResponse(
        id=message.id,
        match_id=message.match_id,
        sender_id=message.sender_id,
        sender_name=current_user.full_name,
        sender_avatar=current_user.avatar_url,
        content=message.content,
        is_read=message.is_read,
        created_at=message.created_at
    )

# ========== STATS ==========
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_matches": db.query(Match).filter(Match.is_active == True).count(),
        "total_messages": db.query(Message).count(),
    }
