from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from db.database import get_db
from models.discussion_comment import DiscussionComment
from models.discussion_post import DiscussionPost

router = APIRouter(prefix="/api/discussion", tags=["discussion"])

DbDep = Annotated[Session, Depends(get_db)]


# --- Posts ---

@router.get("/posts", response_model=List[schemas.PostOut])
def list_posts(db: DbDep):
    return db.query(DiscussionPost).order_by(DiscussionPost.created_at.desc()).all()


@router.post("/posts", response_model=schemas.PostOut, status_code=201)
def create_post(body: schemas.PostIn, db: DbDep):
    post = DiscussionPost(
        user_id=body.user_id,
        author_name=body.author_name,
        title=body.title,
        body=body.body,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}", status_code=204)
def delete_post(post_id: int, db: DbDep):
    post = db.query(DiscussionPost).filter(DiscussionPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()


# --- Comments ---

@router.get("/posts/{post_id}/comments", response_model=List[schemas.CommentOut])
def list_comments(post_id: int, db: DbDep):
    if not db.query(DiscussionPost).filter(DiscussionPost.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")
    return (
        db.query(DiscussionComment)
        .filter(DiscussionComment.post_id == post_id)
        .order_by(DiscussionComment.created_at)
        .all()
    )


@router.post("/posts/{post_id}/comments", response_model=schemas.CommentOut, status_code=201)
def create_comment(post_id: int, body: schemas.CommentIn, db: DbDep):
    if not db.query(DiscussionPost).filter(DiscussionPost.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")
    comment = DiscussionComment(
        post_id=post_id,
        user_id=body.user_id,
        author_name=body.author_name,
        body=body.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
