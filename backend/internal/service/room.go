package service

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/traP-jp/h26_07/backend/internal/model"
	"github.com/traP-jp/h26_07/backend/internal/repository"
)

type RoomService struct {
	roomRepository repository.RoomRepository
}

func NewRoomService(roomRepository repository.RoomRepository) *RoomService {
	return &RoomService{
		roomRepository: roomRepository,
	}
}

func (s *RoomService) CreateRoom(ctx context.Context, settings model.RoomSettings, creator model.UserID) (*model.Room, error) {
	if !settings.HasAdmin(creator) {
		settings.Admins = append(settings.Admins, creator)
	}
	uuid, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}
	room := model.NewRoom(
		model.RoomID(uuid),
		model.RoomCode(fmt.Sprintf("%06d", string(rand.Intn(1000000)))),
		settings,
		time.Now(),
	)
	s.roomRepository.Save(ctx, room)
	return room, nil
}

//func (s *RoomService) GetRoom(ctx context.Context, roomID model.RoomID) (*model.Room, error) {}

//func (s *RoomService) ListRooms(ctx context.Context) ([]model.RoomSummary, error) {}
