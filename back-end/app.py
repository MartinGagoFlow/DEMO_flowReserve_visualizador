import sys
import os

# Obtiene la ruta absoluta de la carpeta 'back-end' donde se encuentra app.py
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construye la ruta a la carpeta 'libs'
libs_path = os.path.join(current_dir, 'libs')

# Añade la carpeta 'libs' a la ruta de búsqueda de módulos de Python
if libs_path not in sys.path:
    sys.path.insert(0, libs_path) # Usar insert(0) para que sea la primera ruta

from flask import Flask, jsonify, send_from_directory
import pickle
import numpy as np
import os
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

# Define el directorio base donde se encuentran los modelos
MODELS_FOLDER = os.path.join(r'./pacientes/P80_Visualizador/')

def convert_ndarray(obj):
    """Convierte recursivamente numpy arrays a listas para JSON"""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_ndarray(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_ndarray(i) for i in obj]
    else:
        return obj


@app.route('/api/models', methods=['GET'])
def list_models():
    # Obtén la lista de carpetas en el directorio MODELS_FOLDER
    folders = [
        folder for folder in os.listdir(MODELS_FOLDER)
        if os.path.isdir(os.path.join(MODELS_FOLDER, folder))
    ]
    return jsonify(folders)


@app.route('/api/models/<string:directory_name>', methods=['GET'])
def get_model_files(directory_name):
    # Construir la ruta completa del directorio del paciente
    directory_path = os.path.join(MODELS_FOLDER, directory_name)
    
    # Verificar si el directorio existe
    if not os.path.exists(directory_path) or not os.path.isdir(directory_path):
        return jsonify({'error': 'Directory not found'}), 404

    # Inicializar las rutas para los archivos que buscamos
    filePath = ''
    graphPath = ''
    calciumPath = ''
    viewsDict = ''

    # Recorrer los archivos del directorio para buscar .vtp, .gexf y .stl y json
    for file in os.listdir(directory_path):
        if file.endswith('.vtp'):
            filePath = os.path.join(directory_name, file).replace(os.sep, '/')
        elif file.endswith('string.gexf'):
            graphPath = os.path.join(directory_name, file).replace(os.sep, '/')
        elif file.endswith('.stl'):
            calciumPath = os.path.join(directory_name, file).replace(os.sep, '/')
        elif file.endswith('.json'):
            viewsDict = os.path.join(directory_name, file).replace(os.sep, '/')


    # Ruta dinámica hacia vesselEndsDict.pkl, subiendo una carpeta desde MODELS_FOLDER
    segment_tracer_path = os.path.normpath(os.path.join(directory_path, '..', 'vesselEndsDict.pkl'))
    print(segment_tracer_path)
    # Leer los datos desde el archivo .pkl
    vessel_data = {}
    if os.path.exists(segment_tracer_path):
        try:
            with open(segment_tracer_path, 'rb') as f:
                raw_data = pickle.load(f)
                print("Claves disponibles en el pkl:", list(raw_data.keys()))  # <- Añadir esto
                # Extraer solo Aorta_inlet (o todo, si prefieres)
                vessel_data = convert_ndarray(raw_data.get("Aorta_inlet", {}))
                
        except Exception as e:
            vessel_data = {'error': str(e)}


    # Construir la respuesta con las rutas encontradas
    print('fullPath: ', directory_path)
    print('filePath: ', filePath)
    print('graphPath: ', graphPath)
    print('calciumPath: ', calciumPath)
    print("vessel_data: ", vessel_data)
    print("aortaInletData: ", vessel_data)
    print("viewsDict: ", viewsDict)
    return jsonify({
        'fullPath': directory_path,
        'filePath': filePath,
        'graphPath': graphPath,
        'calciumPath': calciumPath,
        'aortaInletData': vessel_data,
        'viewsDict': viewsDict
    })


@app.route('/api/models/<path:filename>', methods=['GET'])
def get_model(filename):
    file_path = os.path.join(MODELS_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_from_directory(MODELS_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
