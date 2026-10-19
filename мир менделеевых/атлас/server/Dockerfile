FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node dist ./dist
COPY --chown=node:node server/server.js ./server/server.js
USER node
ENV HOST=0.0.0.0 PORT=8080 NODE_ENV=production
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=4s CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/server.js"]
