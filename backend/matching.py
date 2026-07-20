import math
from typing import List, Tuple
from sqlalchemy.orm import Session
from models import User, Interest, Activity, Swipe, Match
from geopy.distance import geodesic

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return float('inf')
    return geodesic((lat1, lon1), (lat2, lon2)).kilometers

def calculate_compatibility(user1: User, user2: User) -> Tuple[float, List[str], List[str]]:
    """Calculate compatibility score between two users (0-100)."""
    score = 0.0

    # Interest overlap (up to 40 points)
    user1_interests = {i.id for i in user1.interests}
    user2_interests = {i.id for i in user2.interests}
    shared_interest_ids = user1_interests & user2_interests
    total_interests = user1_interests | user2_interests
    if total_interests:
        interest_score = (len(shared_interest_ids) / len(total_interests)) * 40
    else:
        interest_score = 0
    score += interest_score
    shared_interest_names = [i.name for i in user1.interests if i.id in shared_interest_ids]

    # Activity overlap (up to 30 points)
    user1_activities = {a.id for a in user1.activities}
    user2_activities = {a.id for a in user2.activities}
    shared_activity_ids = user1_activities & user2_activities
    total_activities = user1_activities | user2_activities
    if total_activities:
        activity_score = (len(shared_activity_ids) / len(total_activities)) * 30
    else:
        activity_score = 0
    score += activity_score
    shared_activity_names = [a.name for a in user1.activities if a.id in shared_activity_ids]

    # Age compatibility (up to 15 points)
    age_diff = abs(user1.age - user2.age)
    age_score = max(0, 15 - age_diff)
    score += age_score

    # Distance bonus (up to 15 points)
    distance = calculate_distance_km(user1.latitude, user1.longitude, user2.latitude, user2.longitude)
    if distance == float('inf'):
        distance_score = 5  # neutral if no location
    else:
        distance_score = max(0, 15 - (distance / 10))
    score += distance_score

    return round(min(score, 100), 1), shared_interest_names, shared_activity_names

def get_discovery_candidates(
    db: Session, 
    current_user: User, 
    limit: int = 20,
    min_age: int = None,
    max_age: int = None,
    max_distance_km: int = None,
    gender: str = None,
    interest_ids: List[int] = None,
    activity_ids: List[int] = None
) -> List[Tuple[User, float, List[str], List[str], float]]:
    """Get potential matches for the current user with compatibility scores."""

    # Get IDs of users already swiped
    swiped_ids = [s.swiped_id for s in current_user.swipes_made]
    swiped_ids.append(current_user.id)  # exclude self

    # Get matched user IDs
    matched_user_ids = []
    for m in current_user.matches_as_user1:
        if m.is_active:
            matched_user_ids.append(m.user2_id)
    for m in current_user.matches_as_user2:
        if m.is_active:
            matched_user_ids.append(m.user1_id)

    excluded_ids = list(set(swiped_ids + matched_user_ids))

    # Build query
    query = db.query(User).filter(
        User.id.notin_(excluded_ids),
        User.is_active == True
    )

    # Apply age filter
    if min_age is not None:
        query = query.filter(User.age >= min_age)
    if max_age is not None:
        query = query.filter(User.age <= max_age)

    # Apply gender filter
    if gender:
        query = query.filter(User.gender == gender)
    elif current_user.looking_for != "everyone":
        query = query.filter(User.gender == current_user.looking_for)

    # Apply interest filter
    if interest_ids:
        query = query.filter(User.interests.any(Interest.id.in_(interest_ids)))

    # Apply activity filter
    if activity_ids:
        query = query.filter(User.activities.any(Activity.id.in_(activity_ids)))

    candidates = query.all()

    # Score and filter by distance
    results = []
    max_dist = max_distance_km or current_user.max_distance_km or 50

    for candidate in candidates:
        score, shared_interests, shared_activities = calculate_compatibility(current_user, candidate)
        distance = calculate_distance_km(
            current_user.latitude, current_user.longitude,
            candidate.latitude, candidate.longitude
        )

        if distance <= max_dist:
            results.append((candidate, score, shared_interests, shared_activities, distance))

    # Sort by compatibility score descending
    results.sort(key=lambda x: x[1], reverse=True)

    return results[:limit]

def check_mutual_like(db: Session, swiper_id: int, swiped_id: int) -> bool:
    """Check if swiped user has already liked the swiper."""
    mutual = db.query(Swipe).filter(
        Swipe.swiper_id == swiped_id,
        Swipe.swiped_id == swiper_id,
        Swipe.direction == "right"
    ).first()
    return mutual is not None

def create_match(db: Session, user1_id: int, user2_id: int) -> Match:
    """Create a new match between two users."""
    # Ensure consistent ordering
    if user1_id > user2_id:
        user1_id, user2_id = user2_id, user1_id

    # Check if match already exists
    existing = db.query(Match).filter(
        Match.user1_id == user1_id,
        Match.user2_id == user2_id
    ).first()

    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
        return existing

    user1 = db.query(User).filter(User.id == user1_id).first()
    user2 = db.query(User).filter(User.id == user2_id).first()
    score, _, _ = calculate_compatibility(user1, user2)

    match = Match(
        user1_id=user1_id,
        user2_id=user2_id,
        compatibility_score=score
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match
