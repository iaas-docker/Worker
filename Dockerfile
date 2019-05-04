FROM alpine:latest
WORKDIR /root
RUN apk add nodejs && apk add npm && apk add bash
COPY package.json /root
COPY entry-point.sh /root
RUN npm install -y && chmod +x entry-point.sh
COPY src/ /root/src/
RUN chmod 755 src/index.js entry-point.sh
CMD ["/root/src/entry-point.sh"]
ENTRYPOINT ["/root/src/entry-point.sh"]
