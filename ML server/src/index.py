from flask import Flask, render_template,request,make_response
from flask_compress import Compress
from flask_caching import Cache
import os

config= {
    "DEBUG" : True,
    "CACHE_TYPE" : "simple",
    "CACHE_DEFAULT-TIMEOUT" : 300,
    "SEND_FILE_MAX_AGE_DEFAULT" : 31536000
}

application = Flask(__name__)
application.config.from_mapping(config)
COMPRESS_MIMETYPES=['text/html','text/css','text/javascript']
COMPRESS_LEVEL=6
COMPRESS_MIN_SIZE=500
Compress(application)
cache=Cache(application)

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import pandas as pd
from datetime import datetime
import time
options = {
'apiKey': "AIzaSyDpbdnCpUC1d6tDaOBMQ1-3rG5QcN7OFX8",
'authDomain': "crowdmanagement-f5374.firebaseapp.com",
'databaseURL': "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app",
'projectId': "crowdmanagement-f5374",
'storageBucket': "crowdmanagement-f5374.appspot.com",
'messagingSenderId': "1062036382613",
'appId': "1:1062036382613:web:46ade195c3b4b628884c9c",
'measurementId': "G-9B5314EXNL"
# 'databaseURL': "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app"
}

# cred = credentials.Certificate("crowdmanagement-f5374-firebase-adminsdk-f2khz-e33f789d77.json")
# cred = {
# 'apiKey': "AIzaSyDpbdnCpUC1d6tDaOBMQ1-3rG5QcN7OFX8",
# 'authDomain': "crowdmanagement-f5374.firebaseapp.com",
# 'databaseURL': "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app",
# 'projectId': "crowdmanagement-f5374",
# 'storageBucket': "crowdmanagement-f5374.appspot.com",
# 'messagingSenderId': "1062036382613",
# 'appId': "1:1062036382613:web:46ade195c3b4b628884c9c",
# 'measurementId': "G-9B5314EXNL"
# }
firebase_admin.initialize_app(options)


@application.route('/', methods = ['POST','GET'])
def Home():
    print("in")
    if request.method == 'POST':
        content = request.get_json()
        mall = content['mall']
        day = content['day']
        month = content['month']
        year = content['year']
        weekend = content['weekend']
        holiday = content['holiday']
        dayOfWeek = content['dayOfWeek']
        path ="/"+mall+"/"
        ref = db.reference(path)
        a=ref.get()
        df = pd.DataFrame(list(a))
        x = df.iloc[:,2:7]
        y = df.iloc[:,0]
        print(x)
        print(y)
        timestamp = time.mktime(datetime(int(year), int(month), int(day)).timetuple())

        from sklearn.ensemble import RandomForestRegressor
        regressor = RandomForestRegressor(n_estimators = 100,random_state=0)
        regressor.fit(x,y)
        y_pred = regressor.predict([[int(dayOfWeek),int(holiday),int(weekend),int(month),timestamp]])
        print(int(y_pred[0]))
        return str(y_pred[0])

if __name__=='__main__':
    application.run(debug=True,port=int(os.environ.get('PORT',8080)))
