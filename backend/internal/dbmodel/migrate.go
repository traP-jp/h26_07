package dbmodel

import (
	"fmt"
	"math/big"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Models() []any {
	return []any{
		&Room{},
		&RoomUser{},
		&RoomAdmin{},
		&RoomParticipant{},
		&RoomCard{},
		&RoomCardCell{},
		&RoomPickedBall{},
		&RoomBingoRecord{},
		&RoomReachRecord{},
		&RoomMessage{},
	}
}

func AutoMigrate(db *gorm.DB) error {
	if err := prepareRoomCardNumberAutoMigrate(db); err != nil {
		return err
	}
	return db.AutoMigrate(Models()...)
}

type roomCardNumberBackfillColumn struct {
	CardNumber *string `gorm:"column:card_number;type:char(36)"`
}

func (roomCardNumberBackfillColumn) TableName() string {
	return (RoomCard{}).TableName()
}

type roomCardNumberBackfillRow struct {
	CardID string `gorm:"column:card_id"`
}

func prepareRoomCardNumberAutoMigrate(db *gorm.DB) error {
	if !db.Migrator().HasTable(&RoomCard{}) {
		return nil
	}

	if !db.Migrator().HasColumn(&RoomCard{}, "CardNumber") {
		if err := db.Migrator().AddColumn(&roomCardNumberBackfillColumn{}, "CardNumber"); err != nil {
			return err
		}
	}

	var rows []roomCardNumberBackfillRow
	if err := db.
		Table((RoomCard{}).TableName()).
		Select("card_id").
		Where("card_number IS NULL OR card_number = ''").
		Find(&rows).
		Error; err != nil {
		return err
	}

	for _, row := range rows {
		cardNumber, err := legacyCardNumber(row.CardID)
		if err != nil {
			return err
		}
		if err := db.
			Table((RoomCard{}).TableName()).
			Where("card_id = ?", row.CardID).
			UpdateColumn("card_number", cardNumber).
			Error; err != nil {
			return err
		}
	}

	return nil
}

func legacyCardNumber(cardID string) (string, error) {
	id, err := uuid.Parse(cardID)
	if err != nil {
		return "", fmt.Errorf("invalid card id %q for card_number backfill: %w", cardID, err)
	}
	number := new(big.Int).SetBytes(id[:])
	mod := new(big.Int).Exp(big.NewInt(10), big.NewInt(36), nil)
	number.Mod(number, mod)
	return fmt.Sprintf("%036d", number), nil
}
