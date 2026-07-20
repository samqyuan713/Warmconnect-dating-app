from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Table, ARRAY
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import json

# Association tables
user_interests = Table(
    "user_interests",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("interest_id", Integer, ForeignKey("interests.id"), primary_key=True),
)

user_activities = Table(
    "user_activities",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("activity_id", Integer, ForeignKey("activities.id"), primary_key=True),
)

class Interest(Base):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    category = Column(String(50))  # e.g., "sports", "arts", "music"
    icon = Column(String(50), default="star")

    users = relationship("User", secondary=user_interests, back_populates="interests")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    category = Column(String(50))  # e.g., "outdoor", "indoor", "social"
    description = Column(Text)
    icon = Column(String(50), default="activity")

    users = relationship("User", secondary=user_activities, back_populates="activities")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(100))
    age = Column(Integer)
    gender = Column(String(20))
    looking_for = Column(String(20), default="everyone")  # male, female, everyone
    bio = Column(Text, default="")
    occupation = Column(String(100), default="")
    location = Column(String(200), default="")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    profile_photos = Column(Text, default="[]")  # JSON array of photo URLs
    avatar_url = Column(String(500), default="")

    # Matching preferences
    min_age = Column(Integer, default=18)
    max_age = Column(Integer, default=99)
    max_distance_km = Column(Integer, default=50)

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interests = relationship("Interest", secondary=user_interests, back_populates="users")
    activities = relationship("Activity", secondary=user_activities, back_populates="users")

    # Swipe relationships
    swipes_made = relationship("Swipe", foreign_keys="Swipe.swiper_id", back_populates="swiper")
    swipes_received = relationship("Swipe", foreign_keys="Swipe.swiped_id", back_populates="swiped")

    # Match relationships
    matches_as_user1 = relationship("Match", foreign_keys="Match.user1_id", back_populates="user1")
    matches_as_user2 = relationship("Match", foreign_keys="Match.user2_id", back_populates="user2")

    # Message relationships
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")

    def get_photos(self):
        try:
            return json.loads(self.profile_photos)
        except:
            return []

    def set_photos(self, photos):
        self.profile_photos = json.dumps(photos)

class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    swiper_id = Column(Integer, ForeignKey("users.id"))
    swiped_id = Column(Integer, ForeignKey("users.id"))
    direction = Column(String(10))  # "left" (pass) or "right" (like)
    created_at = Column(DateTime, default=datetime.utcnow)

    swiper = relationship("User", foreign_keys=[swiper_id], back_populates="swipes_made")
    swiped = relationship("User", foreign_keys=[swiped_id], back_populates="swipes_received")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    compatibility_score = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user1 = relationship("User", foreign_keys=[user1_id], back_populates="matches_as_user1")
    user2 = relationship("User", foreign_keys=[user2_id], back_populates="matches_as_user2")
    messages = relationship("Message", back_populates="match", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
