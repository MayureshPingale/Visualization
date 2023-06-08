import pandas as pd 
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt 
from flask import Flask, render_template, request, redirect
from flask_cors import CORS
import numpy as np
import json
from sklearn.cluster import KMeans
from sklearn import metrics
from scipy.spatial.distance import cdist

app = Flask(__name__)
CORS(app)

dimesionality_index = 4
cols = ["accommodates", "bathrooms", "bedrooms","price", "minimum_nights", "number_of_reviews", "review_scores_rating", "review_scores_cleanliness","review_scores_location"]
df = pd.read_csv('static/data/processed-final.csv', usecols = cols)
X = df.iloc[:,:].values
X_scaled = MinMaxScaler().fit_transform(X)
pca = PCA()
pca_fit = pca.fit(X_scaled)
PCA_fit_transform = pca.transform(X_scaled)
loadings = np.transpose(pca.components_)


exp_var_ratio = pca_fit.explained_variance_ratio_
exp_var_cumulative= np.cumsum(exp_var_ratio)

unchaged_data=df.copy()
scaled_data_df=pd.DataFrame(X_scaled, columns=unchaged_data.columns)
pc_cols = ['PC 1', 'PC 2', 'PC 3', 'PC 4', 'PC 5', 'PC 6', 'PC 7', 'PC 8', 'PC 9']
loadings_df  = pd.DataFrame(np.transpose(pca.components_),columns=pc_cols, index=scaled_data_df.columns)
top_4_attributes = []

inertias = []
K = range(1, 20)
for k in K:
    kmeanModel = KMeans(n_clusters=k).fit(X)
    kmeanModel.fit(X)
    inertias.append(kmeanModel.inertia_)


def calculateSquareLoadings(horizontal,di):
    square=0
    for i in np.arange(di):
        square+= horizontal[pc_cols[i]]*horizontal[pc_cols[i]]
    return square


@app.route('/pca', methods =["GET", "POST"])
def pca():
    global dimesionality_index

    if request.method  == 'POST':
        jsdata = request.form['javascript_data']
        jsdata = json.loads(jsdata)
        print(type(jsdata))
        dimesionality_index = jsdata["i"] + 1
        print(jsdata)

    data = {
        'exp_var_ratio' : exp_var_ratio.tolist(),
        'exp_var_cumulative': exp_var_cumulative.tolist(),
    }

    print(dimesionality_index)
    return render_template('scree.html', data = data)


@app.route('/biplot')
def biplot():
    top_two_features = PCA_fit_transform[:,:2]
    top_two_loadings = loadings[:,:2]

    km = KMeans(n_clusters= 5)
    color_cap = km.fit_predict(X)
    
    data = {
        'top_two_features' : top_two_features.tolist(),
        'loadings': top_two_loadings.tolist(),
        'col': cols,
        'colors': color_cap.tolist()
    }

    return render_template('biplot.html', data = data)

@app.route('/kmeans')
def kmeans():
    return render_template('kmeans.html', data = inertias)


@app.route('/scatterplot')
def scatterplot():
    global top_4_attributes
    df_top_di = loadings_df[pc_cols[0:dimesionality_index]]
    df_top_di['SumSquareLoadings'] = df_top_di.apply(calculateSquareLoadings, axis=1,di=dimesionality_index)
    df_top_di= df_top_di.sort_values(by=['SumSquareLoadings'],ascending=False)

    top_4_attributes.clear()
    for row in df_top_di.head(4).index: 
        top_4_attributes.append((row) )


    km = KMeans(n_clusters= 5)

    original_data = unchaged_data[top_4_attributes]
    original_data['color'] =  km.fit_predict(original_data)

    data = {
        'original_data' : original_data.to_json(),
        'top_4_attributes_loadings': df_top_di.head(4).to_json()
    }
    
    return render_template('scatterplotmatrix.html', data = data)

@app.route('/')
def base():
    return render_template('index.html')

app.run()