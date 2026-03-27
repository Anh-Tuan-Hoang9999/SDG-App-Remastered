from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union, Literal, Annotated
from models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str
    course_code: Optional[str] = None


class UserOut(UserBase):
    id: int
    user_type: UserRole
    is_active: bool
    course_code: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    description: Optional[str] = None
      
      
# Activity Schemas


# Multiple Choice Quiz


class QuizChoice(BaseModel):
    id: int
    text: str


class QuizQuestion(BaseModel):
    question_text: str
    options: List[str]
    correct_option_index: int


class QuizContent(BaseModel):
    title: str
    questions: List[QuizQuestion]


class MatchingPair(BaseModel):
    left: str
    right: str


class MatchingContent(BaseModel):
    title: str
    pairs: List[MatchingPair]


class FlashcardItem(BaseModel):
    front: str
    back: str


class FlashcardContent(BaseModel):
    title: str
    cards: List[FlashcardItem]


class ActivityCreateBase(BaseModel):
    sdg_card_id: int
    activity_stats: Optional[dict] = None


class QuizCreate(ActivityCreateBase):
    activity_type: Literal["quiz"]
    activity_content: QuizContent


class MatchingCreate(ActivityCreateBase):
    activity_type: Literal["matching"]
    activity_content: MatchingContent


class FlashcardCreate(ActivityCreateBase):
    activity_type: Literal["flashcard"]
    activity_content: FlashcardContent


# This union uses 'activity_type' to decide which schema to validate against
ActivityCreate = Annotated[
    Union[QuizCreate, MatchingCreate, FlashcardCreate],
    Field(discriminator="activity_type"),
]


class ActivityOut(BaseModel):
    activity_id: int
    sdg_card_id: int
    activity_type: str
    activity_content: dict

    class Config:
        from_attributes = True


# UserActivity Schemas


class UserActivityCreate(BaseModel):
    activity_id: int


class UserActivitySave(BaseModel):
    user_activity_data: dict


class UserActivityComplete(BaseModel):
    user_activity_data: dict
    grade: str


class UserActivityOut(BaseModel):
    user_activity_id: int
    activity_id: int
    user_id: int
    activity_status: str
    grade: Optional[str] = None
    user_activity_data: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
