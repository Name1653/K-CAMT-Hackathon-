# K-CAMT-Hackathon

## Google Maps route page

The route page uses the Spring Boot API at `http://localhost:8080/api/maps`.
Set these environment variables before starting the backend:

```powershell
$env:GOOGLE_MAPS_WEB_API_KEY="your restricted web key"
$env:GOOGLE_MAPS_SERVER_API_KEY="your restricted server key"
cd ..\demo
.\gradlew.bat bootRun
```

Serve this frontend over HTTP (do not open `route.html` as a `file://` URL):

```powershell
python -m http.server 3000
```

Then open `http://localhost:3000/route.html`.
