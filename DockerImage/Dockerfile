From python:3.11

RUN apt-get update
RUN apt-get upgrade -y

RUN pip install openai==0.28

COPY ./code /src/


WORKDIR /src
RUN chmod +x /src/main.sh
ENTRYPOINT ["/src/main.sh"]
