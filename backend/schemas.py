from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# ========== Interest & Activity Schemas ==========
class InterestBase(BaseModel):
    name: str
    category: str
    icon: Optional[str] = "star"

class InterestCreate(InterestBase):
    pass

class InterestResponse(InterestBase):
    id: int

    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    icon: Optional[str] = "activity"

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int

    class Config:
        from_attributes = True

# ========== User Schemas ==========
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    age: int = Field(..., ge=18, le=120)
    gender: str
    looking_for: str = "everyone"
    bio: Optional[str] = ""
    occupation: Optional[str] = ""
    location: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    min_age: int = 18
    max_age: int = 99
    max_distance_km: int = 50

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    interest_ids: List[int] = []
    activity_ids: List[int] = []

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    occupation: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_distance_km: Optional[int] = None
    looking_for: Optional[str] = None
    interest_ids: Optional[List[int]] = None
    activity_ids: Optional[List[int]] = None
    avatar_url: Optional[str] = None
    profile_photos: Optional[List[str]] = None

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = ""
    profile_photos: List[str] = []
    is_active: bool
    created_at: datetime
    interests: List[InterestResponse] = []
    activities: List[ActivityResponse] = []

    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    compatibility_score: Optional[float] = None
    distance_km: Optional[float] = None
    shared_interests: List[str] = []
    shared_activities: List[str] = []

# ========== Auth Schemas ==========
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# ========== Swipe Schemas ==========
class SwipeCreate(BaseModel):
    swiped_id: int
    direction: str  # "left" or "right"

class SwipeResponse(BaseModel):
    id: int
    swiper_id: int
    swiped_id: int
    direction: str
    is_match: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ========== Match Schemas ==========
class MatchResponse(BaseModel):
    id: int
    user: UserResponse
    compatibility_score: float
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# ========== Message Schemas ==========
class MessageCreate(BaseModel):
    match_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    match_id: int
    sender_id: int
    sender_name: str
    sender_avatar: Optional[str] = ""
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ========== Discovery Schemas ==========
class DiscoveryFilters(BaseModel):
    min_age: Optional[int] = 18
    max_age: Optional[int] = 99
    max_distance_km: Optional[int] = 50
    gender: Optional[str] = None
    interest_ids: Optional[List[int]] = None
    activity_ids: Optional[List[int]] = None
