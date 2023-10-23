package main

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"net/http"
	"os"
)

type Todo struct {
	gorm.Model
	Name   string `json:"name"`
	Status bool   `json:"status" gorm:"default:true"`
}

type UpdateTodo struct {
	Name   *string `json:"name"`
	Status *bool   `json:"status"`
}

func main() {
	app := fiber.New()

	psHost := os.Getenv("POSTGRES_HOST")
	psUser := os.Getenv("POSTGRES_USER")
	psPassword := os.Getenv("POSTGRES_PASSWORD")
	psDB := os.Getenv("POSTGRES_DB")
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		psHost, 5432, psUser, psPassword, psDB)

	db, err := gorm.Open(postgres.Open(dsn))
	if err != nil {
		panic("failed to connect database")
	}

	err = db.AutoMigrate(&Todo{})
	if err != nil {
		panic("failed to migrate database")
	}

	log.Println("DB has been initialized")

	app.Use(logger.New())

	app.Post("/api/v1/todos", func(c *fiber.Ctx) error {
		todo := new(Todo)
		if err := c.BodyParser(todo); err != nil {
			return c.Status(400).SendString(err.Error())
		}
		db.Create(&todo)
		return c.Status(http.StatusCreated).JSON(todo)
	})

	app.Get("/api/v1/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World")
	})

	app.Get("/api/v1/todos", func(c *fiber.Ctx) error {
		var todos []Todo
		db.Find(&todos)
		return c.Status(http.StatusOK).JSON(todos)
	})

	app.Get("/api/v1/todos/:todoId", func(c *fiber.Ctx) error {
		id := c.Params("todoId")
		var todo Todo
		result := db.First(&todo, id)

		if result.RowsAffected == 0 {
			return c.SendStatus(http.StatusNotFound)
		}
		return c.Status(http.StatusOK).JSON(&todo)
	})

	app.Put("/api/v1/todos/:todoId", func(c *fiber.Ctx) error {
		id := c.Params("todoId")

		var updateTodo UpdateTodo
		if err := c.BodyParser(&updateTodo); err != nil {
			return c.Status(http.StatusBadRequest).SendString(err.Error())
		}

		var todo Todo
		result := db.First(&todo, id)
		if result.RowsAffected == 0 {
			return c.SendStatus(http.StatusNotFound)
		}

		if updateTodo.Name != nil {
			todo.Name = *updateTodo.Name
		}
		if updateTodo.Status != nil {
			todo.Status = *updateTodo.Status
		}
		db.Save(todo)

		return c.Status(http.StatusOK).JSON(todo)
	})

	app.Delete("/api/v1/todos/:todoId", func(c *fiber.Ctx) error {
		id := c.Params("todoId")
		var todo Todo

		result := db.Delete(&todo, id)

		if result.RowsAffected == 0 {
			return c.SendStatus(http.StatusNotFound)
		}

		return c.SendStatus(http.StatusOK)
	})

	app.Static("/", "./public")

	log.Println("Server started!")
	log.Fatal(app.Listen(":8080"))
}
