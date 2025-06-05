import os

class Config:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-dev-key')
    
    # Determine if running in Docker
    IN_DOCKER = os.getenv('DOCKER_ENV', 'false').lower() == 'true'
    
    # Choose appropriate MongoDB URI based on environment
    if IN_DOCKER:
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://root:example@mongodb:27017/?authSource=admin')
    else:
        MONGO_URI = os.getenv('MONGO_URI_LOCAL', 'mongodb://localhost:27017')

    # Database name
    MONGO_DBNAME = 'accs'
    
    # Other configuration settings
    DEBUG = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    HOST = '0.0.0.0'
    PORT = 8888 