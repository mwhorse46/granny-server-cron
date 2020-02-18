# Utility service from Granny image delivery service

[![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/assorium/granny-server-cron?style=for-the-badge "Docker Cloud Automated build")](https://hub.docker.com/r/assorium/granny-server-cron "Docker Cloud Automated build")
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/assorium/granny-server-cron?style=for-the-badge "Docker Cloud Build Status")](https://hub.docker.com/r/assorium/granny-server-cron "Docker Cloud Build Status")
[![Docker Pulls](https://img.shields.io/docker/pulls/assorium/granny-server-cron?style=for-the-badge "Docker Pulls")](https://hub.docker.com/r/assorium/granny-server-cron "Docker Pulls")  <br/>

[![Latest Github tag](https://img.shields.io/github/v/tag/mrspartak/granny-server-cron?sort=date&style=for-the-badge "Latest Github tag")](https://github.com/mrspartak/granny-server-cron/releases "Latest Github tag")
[![Join the chat at https://gitter.im/granny-js/community](https://img.shields.io/gitter/room/granny-js/community?style=for-the-badge)](https://gitter.im/granny-js/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Ecosystem
![image](https://user-images.githubusercontent.com/993910/74678258-8f250380-51cb-11ea-9b5e-1640e713380e.PNG)

[granny-server-backend](https://github.com/mrspartak/granny-server-backend "granny-server-backend") - Backend service with API exposed to upload and serve/manipulate images  
[granny-js-client](https://github.com/mrspartak/granny-js-client "granny-js-client") - Client library that works both in nodejs and browser. Makes API calls easier  
[granny-server-frontend](https://github.com/mrspartak/granny-server-frontend "granny-server-frontend") - Frontend APP that uses client to manage your CDN domains and settings  
[granny-server-cron](https://github.com/mrspartak/granny-server-cron "granny-server-cron") - Utility app  



## Environment variables
    #mongo connection string
    const MONGO = process.env.DEBUG || 'mongodb://localhost/js_cdn'
    #debug messages
    const DEBUG = process.env.DEBUG || false
    
## Docker
```
docker run -p 3000:3000 --name granny-server-backend \
  -e MONGO='mongodb://user@password:example.com/granny' \
  assorium/granny-server-backend:latest
```