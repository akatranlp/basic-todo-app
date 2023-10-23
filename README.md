# basic-todo-app
Basic Todo app with go and react

Build and run the application with

```bash
docker build -t <image-name> .
docker run -it --name <container-name> -e TZ="Europe/Berlin" -p 8080:8080 <image-name>
```

or

```bash
docker-compose up --build -d 
```
