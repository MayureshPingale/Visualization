import pandas as pd 
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from flask import Flask, render_template, request, redirect
from flask_cors import CORS
import numpy as np
import json
from sklearn.cluster import KMeans
from sklearn.manifold import MDS

app = Flask(__name__)
CORS(app)

cols = ["accommodates", "bathrooms", "bedrooms","price", "minimum_nights", "no_of_reviews", "scores_rating", "scores_cleanliness","scores_location"]
df = pd.read_csv('static/data/processed-final.csv', usecols = cols)
X = df.iloc[:,:].values
variables_selected = []
# mds_data = MDS(n_components=2,metric=True,dissimilarity='euclidean').fit_transform(X)


# inertias = []
# K = range(1, 20)
# for k in K:
#     kmeanModel = KMeans(n_clusters=k).fit(X)
#     kmeanModel.fit(X)
#     inertias.append(kmeanModel.inertia_)

@app.route('/mds_data_plot')
def mds_data_plot():
    
    km = KMeans(n_clusters= 5)
    color_cap = km.fit_predict(X)

    data = {
        'top_two_features' : mds_data.tolist(),
        'colors': color_cap.tolist()
    }

    return render_template('mds_data.html', data = data)

@app.route('/mds_variable_plot', methods =["GET", "POST"])
def mds_variables_plot():
    global variables_selected

    if request.method  == 'POST':
        jsdata = request.form['javascript_data']
        jsdata = json.loads(jsdata)
        variables_selected.append(cols[jsdata["i"]])

        res = []
        [res.append(x) for x in variables_selected if x not in res]
        variables_selected = res

        print(variables_selected)
    else:
        variables_selected.clear()


    all_df = pd.read_csv('static/data/processed-final.csv')
    km = KMeans(n_clusters= 5)
    all_df['color'] =  km.fit_predict(X)

    corr_data =  1 -  abs(df.corr())
    mds_variables_data = MDS(n_components=2,metric=True,dissimilarity='precomputed', random_state = 0).fit_transform(corr_data)

    data = {
        'top_two_features' : mds_variables_data.tolist(),
        'col': cols,
        'col_selected': variables_selected,
        'all_df': all_df.to_json(orient="records")
    } 

    return render_template('mds_variable.html', data = data)


@app.route('/kmeans')
def kmeans():
    return render_template('kmeans.html', data = inertias)

@app.route('/parallel_plot')
def parallel_plot():
    all_df = pd.read_csv('static/data/processed-final.csv')
    selected_df = pd.read_csv('static/data/processed-final.csv')

    km = KMeans(n_clusters= 5)
    all_df['color'] =  km.fit_predict(X)

    if len(variables_selected) != 0:
        selected_df = all_df[variables_selected]

    selected_df['color'] = all_df['color']

    data = {
        'all_df' : all_df.to_json(orient="records"),
        'selected_df' : selected_df.to_json(orient="records")
    }


    return render_template('pcp.html', data = data)

@app.route('/')
def base():
    return render_template('index.html')


@app.route('/test')
def base3():
    return render_template('sunburst.html')

@app.route('/plotly')
def base4():
    return render_template('plotSunBurst.html')



@app.route('/sunburst', methods = ['GET'])
def loadSunBarChart():
    country = request.args.get("country")
    all_df = pd.read_csv('static/data/no_null.csv', usecols=["Country","Life Ladder", "preprimary_education", "primary_education", "secondary_eductaion", "Rural population", "Urban population", "electricity", "Unemployment male rate","Unemployment women rate", "Population", "Internet services"])
    valuesPerCountry = all_df[all_df['Country'] == country]
    valuesPerCountry['Education'] = (valuesPerCountry['preprimary_education'] + valuesPerCountry['primary_education'] + valuesPerCountry['secondary_eductaion'])/3
    valuesPerCountry['UnEmployment'] = valuesPerCountry['Unemployment male rate'] + valuesPerCountry['Unemployment women rate'] 
    
    order = ["Life Ladder", "Education", "Population", "electricity", "UnEmployment", "Internet services", "preprimary_education", "primary_education", "secondary_eductaion", "Rural population", "Urban population", "Unemployment male rate", "Unemployment women rate"]
    values = []
    
    for i in order:
        values.append(int(valuesPerCountry.mean()[i]))

    values[2] = 100
    return values
app.run()