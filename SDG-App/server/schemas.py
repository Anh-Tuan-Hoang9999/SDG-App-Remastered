from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, EmailStr


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"   # "student" | "coordinator"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserUpdateIn(BaseModel):
    name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# SDGs
# ---------------------------------------------------------------------------

class SDGOut(BaseModel):
    id: int
    number: int
    title: str
    description: str
    icon: Optional[str] = None
    color: Optional[str] = None
    example: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------

class QuizQuestionOut(BaseModel):
    id: int
    sdg_number: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: Optional[str] = None
    fun_facts: Optional[str] = None

    class Config:
        from_attributes = True


class QuizSubmitIn(BaseModel):
    user_id: int
    score: int
    total: int
    answers_json: Optional[Any] = None   # list of {question_id, chosen, correct}


class QuizResultOut(BaseModel):
    id: int
    user_id: int
    score: int
    total: int
    answers_json: Optional[Any] = None
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Card Sort
# ---------------------------------------------------------------------------

class CardSortIn(BaseModel):
    user_id: int
    most_relevant: Optional[List[int]] = None
    somewhat_relevant: Optional[List[int]] = None
    least_relevant: Optional[List[int]] = None


class CardSortOut(BaseModel):
    id: int
    user_id: int
    most_relevant: Optional[Any] = None
    somewhat_relevant: Optional[Any] = None
    least_relevant: Optional[Any] = None
    saved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Reflections
# ---------------------------------------------------------------------------

class ReflectionIn(BaseModel):
    user_id: int
    title: str
    type: Optional[str] = None
    sdg_numbers: Optional[List[int]] = None
    reflection_text: str
    employer_discussion: bool = False


class ReflectionOut(BaseModel):
    id: int
    user_id: int
    title: str
    type: Optional[str] = None
    sdg_numbers: Optional[Any] = None
    reflection_text: str
    employer_discussion: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj, **kwargs):
        # Map reflection_type -> type for the response
        if hasattr(obj, "reflection_type"):
            obj.__dict__.setdefault("type", obj.reflection_type)
        return super().model_validate(obj, **kwargs)


# ---------------------------------------------------------------------------
# User Progress
# ---------------------------------------------------------------------------

class ProgressPatchIn(BaseModel):
    viewed_sdg_cards: Optional[List[int]] = None
    completed_card_sort: Optional[bool] = None
    completed_quiz: Optional[bool] = None
    reflection_count: Optional[int] = None
    viewed_resources: Optional[List[Any]] = None


class ProgressOut(BaseModel):
    id: int
    user_id: int
    viewed_sdg_cards: Optional[Any] = None
    completed_card_sort: bool
    completed_quiz: bool
    reflection_count: int
    viewed_resources: Optional[Any] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Discussion
# ---------------------------------------------------------------------------

class PostIn(BaseModel):
    user_id: int
    author_name: str
    title: str
    body: str


class PostOut(BaseModel):
    id: int
    user_id: int
    author_name: str
    title: str
    body: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CommentIn(BaseModel):
    user_id: int
    author_name: str
    body: str


class CommentOut(BaseModel):
    id: int
    post_id: int
    user_id: int
    author_name: str
    body: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------

class StudentSummaryOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    completed_card_sort: Optional[bool] = None
    completed_quiz: Optional[bool] = None
    reflection_count: Optional[int] = None

    class Config:
        from_attributes = True


class ReflectionSummaryOut(BaseModel):
    id: int
    user_id: int
    title: str
    type: Optional[str] = None
    employer_discussion: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
