package handler

import (
	"cmp"
	"net/http"
	"slices"

	"github.com/labstack/echo/v5"
	authmiddleware "github.com/traP-jp/h26_07/backend/internal/middleware"
	"github.com/traP-jp/h26_07/backend/internal/model"
	"github.com/traP-jp/h26_07/backend/internal/openapi"
	"github.com/traP-jp/h26_07/backend/internal/service"
)

type RoomHandler struct {
	roomService *service.RoomService
}

func NewRoomHandler(roomService *service.RoomService) *RoomHandler {
	return &RoomHandler{
		roomService: roomService,
	}
}
func convertUserIDsToModel(userIDS []openapi.UserID) []model.UserID {
	var result []model.UserID
	for _, userID := range userIDS {
		result = append(result, model.UserID(userID))
	}
	return result
}

func convertOptionalUserIDsToModel(userIDs *[]openapi.UserID) []model.UserID {
	if userIDs == nil {
		return []model.UserID{}
	}
	return convertUserIDsToModel(*userIDs)
}

func convertUserIDsToOpenAPI(userIDs []model.UserID) []openapi.User {
	var result []openapi.User
	for _, userID := range userIDs {
		result = append(result, openapi.User{UserID: openapi.UserID(userID)})
	}
	return result
}

func convertRoomSettingsToModel(settings openapi.GameSettingsInput) model.RoomSettings {
	return model.RoomSettings{
		Name:        settings.Name,
		Description: settings.Description,
		Admins:      convertOptionalUserIDsToModel(settings.AdminUserIds),
	}
}

func convertRoomSettingsToOpenAPI(settings model.RoomSettings) openapi.GameSettings {
	return openapi.GameSettings{
		Name:        settings.Name,
		Description: settings.Description,
		Admins:      convertUserIDsToOpenAPI(settings.Admins),
	}
}

func convertParticipantsToOpenAPI(participants []model.Participant) []openapi.ParticipantSummary {
	var result []openapi.ParticipantSummary
	for _, participant := range participants {
		result = append(result, openapi.ParticipantSummary{
			User:     openapi.User{UserID: openapi.UserID(participant.UserID)},
			JoinedAt: participant.JoinedAt,
		})
	}
	return result
}

func toOpenAPIBingoSummaries(records []model.BingoRecord) []openapi.BingoSummary {
	sortedRecords := slices.Clone(records)
	slices.SortFunc(sortedRecords, func(a, b model.BingoRecord) int {
		if n := cmp.Compare(a.Order, b.Order); n != 0 {
			return n
		}
		return cmp.Compare(a.UserID, b.UserID)
	})

	summaries := make([]openapi.BingoSummary, 0)
	indexByUserID := make(map[model.UserID]int)

	for _, record := range sortedRecords {
		index, ok := indexByUserID[record.UserID]
		if !ok {
			index = len(summaries)
			indexByUserID[record.UserID] = index
			summaries = append(summaries, openapi.BingoSummary{
				User: openapi.User{
					UserID: openapi.UserID(record.UserID),
				},
				BingoOrders: []int{},
			})
		}

		summaries[index].BingoOrders = append(
			summaries[index].BingoOrders,
			int(record.Order),
		)
	}

	return summaries
}

func convertRoom(room *model.Room) openapi.Room {
	return openapi.Room{
		RoomID:         openapi.RoomID(room.RoomID.String()),
		Settings:       convertRoomSettingsToOpenAPI(room.Settings),
		State:          openapi.RoomState(room.State),
		PickState:      openapi.PickState(room.PickState),
		QrCodeVisible:  room.QrCodeVisible,
		Participants:   convertParticipantsToOpenAPI(room.Participants),
		BingoSummaries: toOpenAPIBingoSummaries(room.BingoRecords),
		CreatedAt:      room.CreatedAt,
		UpdatedAt:      room.UpdatedAt,
		RoomCode:       openapi.RoomCode(room.RoomCode),
	}
}

func (h *RoomHandler) PostRoom(c *echo.Context) error {
	user, ok := authmiddleware.GetAuthenticatedUser(c)
	if !ok {
		return c.NoContent(http.StatusUnauthorized)
	}
	var req openapi.CreateRoomRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, openapi.Error{
			Message: "invalid request body",
		})
	}

	room, err := h.roomService.CreateRoom(c.Request().Context(), convertRoomSettingsToModel(req.Settings), model.UserID(user.Name))
	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			openapi.Error{
				Message: "failed to create uuid",
			},
		)
	}
	return c.JSON(http.StatusOK, convertRoom(room))
}
