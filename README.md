# Utility service from Granny image delivery service

[![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/assorium/granny-server-cron?style=for-the-badge "Docker Cloud Automated build")](https://hub.docker.com/r/assorium/granny-server-cron "Docker Cloud Automated build")
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/assorium/granny-server-cron?style=for-the-badge "Docker Cloud Build Status")](https://hub.docker.com/r/assorium/granny-server-cron "Docker Cloud Build Status")
[![Docker Pulls](https://img.shields.io/docker/pulls/assorium/granny-server-cron?style=for-the-badge "Docker Pulls")](https://hub.docker.com/r/assorium/granny-server-cron "Docker Pulls")  <br/>

[![Latest Github tag](https://img.shields.io/github/v/tag/mrspartak/granny-server-cron?sort=date&style=for-the-badge "Latest Github tag")](https://github.com/mrspartak/granny-server-cron/releases "Latest Github tag")

## Ecosystem
![image](https://user-images.githubusercontent.com/993910/74383777-e8261d80-4e00-11ea-8373-25070ec1ca97.png)

[granny-server-backend](https://github.com/mrspartak/granny-server-backend "granny-server-backend") - Backend service with API exposed to upload and serve/manipulate images  
[granny-js-client](https://github.com/mrspartak/granny-js-client "granny-js-client") - Client library that works both in nodejs and browser. Makes API calls easier  
[granny-server-frontend](https://github.com/mrspartak/granny-server-frontend "granny-server-frontend") - Frontend APP that uses client to manage your CDN domains and settings  

[granny-server-cron](https://github.com/mrspartak/granny-server-cron "granny-server-cron") - Utility app  



## Environment variables
    #mongo connection string
    const MONGO = process.env.DEBUG || 'mongodb://localhost/js_cdn'
    #S3 connection data
    const S3_HOST = process.env.S3_HOST || '127.0.0.1'
    const S3_PORT = process.env.S3_PORT || 9000
    const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin'
    const S3_ACCESS_SECRET = process.env.S3_ACCESS_SECRET || 'minioadmin'
    #start logging
    const DEBUG = process.env.DEBUG || false
    
## Docker
```
docker run -p 3000:3000 --name granny-server-backend \
  -e MONGO='mongodb://user@password:example.com/granny' \
  assorium/granny-server-backend:latest
```