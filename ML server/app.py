from flask import Flask, render_template,request,make_response
from flask_compress import Compress
from flask_caching import Cache


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
import holidays
in_holidays = holidays.CountryHoliday('IN', prov='KA')
options = {
'databaseURL': "https://crowdmanagement-f5374-default-rtdb.asia-southeast1.firebasedatabase.app"
}

cred = credentials.Certificate("crowdmanagement-f5374-firebase-adminsdk-f2khz-e33f789d77.json")

firebase_admin.initialize_app(cred , options)


@application.route('/', methods = ['POST','GET'])
def Home():
    print("in")
    if request.method == 'POST':
        content = request.get_json()
        mall = content['mall']
        day = content['day']
        month = int(content['month'])+1
        year = content['year']
        date = datetime(int(year),int(month),int(day))
        print(date.strftime('%b'))
        dayOfWeek = date.weekday()
        holiday = int(date in in_holidays)
        weekend = 0
        if dayOfWeek>4:
            weekend=1
        path ="/"+mall+"/ML"
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
    application.run(debug=True)
