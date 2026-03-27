from db.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class SDGCard(Base):
    __tablename__ = "sdg_cards"
    
    card_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sdg_name = Column(String(255), unique=True, nullable=False)
    content = Column(String(5000), nullable=False)
    card_front_url = Column(String(255), nullable=True)
    card_back_url = Column(String(255), nullable=True)

    activities = relationship("Activity", back_populates="sdg_card")