# Mealio

### Install Docker for Windows (if you haven't already)
- Download and install Docker Desktop for Windows:  
https://www.docker.com/products/docker-desktop  
- During installation, enable WSL 2 backend (recommended).  
- Start Docker Desktop and make sure it is running.  
- Open a command prompt or PowerShell and verify:  

```
docker --version
docker compose version
```
---
### Running the Docker Container
- Run the line below in home Mealio project folder,
``` 
docker compose up --build
```

#### What to expect 
- Both backend and frontend services start automatically
- A development server for the frontend runs with hot reload enabled
- The backend API runs and is accessible to the frontend

#### Incase something goes wrong
- If something goes wrong or you can't view the path to the site write:   
``` 
docker compose logs  
```

