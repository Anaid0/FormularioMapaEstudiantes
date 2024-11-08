from flask import Flask, request, jsonify # Se realiza una importación de Flask el cual es un framework de Python para la creación de aplicación web
from flask_cors import CORS  #Esta Importación CORS permite que la API sea accesible desde otros dominios
import mysql.connector  #Se conecta el mysql con Python

app = Flask(__name__)
CORS(app) #Permie que se pueda aceptar desde varios origenes


def obtener_conexion():  #Se define el host, user, contraseña y el nombre de la base de datos del mysqlWorkbench
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="12345",
        database="LUGARES"
    )

@app.route('/submit', methods=['POST']) #Se pide a la app un metodo el cual es post y la applicación debe responder con el /submit esto es para enviar los datos 
def agregar_usuario(): #La petición post se define como agregar usuario
    documento = request.form.get('documento')
    nombres = request.form.get('nombres')
    apellidos = request.form.get('apellidos')
    direccionCasa = request.form.get('direccionCasa')
    latitudCasa = request.form.get('latitudCasa')
    longitudCasa = request.form.get('longitudCasa')
    direccionTrabajo = request.form.get('direccionTrabajo')
    latitudTrabajo = request.form.get('latitudTrabajo')
    longitudTrabajo = request.form.get('longitudTrabajo')
    
    try:
        conexion = obtener_conexion() #Se realiza la conexión a la base de datos
        cursor = conexion.cursor() #Se realiza la conexión para ejecutar el SQL
        
        cursor.callproc('CreateLugar', (  #Se llama el Procedimiento "Create Lugar" en el Workbench con los atricutos que contiene este
            documento, nombres, apellidos, 
            direccionCasa, float(latitudCasa), float(longitudCasa), 
            direccionTrabajo, float(latitudTrabajo), float(longitudTrabajo)
        ))
        conexion.commit() #Se guardan los datos

        return jsonify({"message": "Usuario guardado exitosamente"}), 200 #Si el proceso se realiza correctamente sale un mensaje JSON con usuario guardado exitosamente
    except Exception as e:
        print(f"Error al guardar usuario: {e}")
        return jsonify({"message": "Error al guardar el usuario"}), 500 #Si sale error manda un mensaje JSON con error al guardar el usuario
    finally:
        cursor.close() #Se cierra la conexión del cursor
        conexion.close() #Se cierra la conexión de la base de datos

@app.route('/usuarios', methods=['GET']) #Se pide a la app un metodo el cual es Get y la applicación debe responder con el /usuarios esto es para obtener el listado del usuario
def listar_usuarios(): #La petición Get se define como  listar_usuarios
    try:
        conexion = obtener_conexion() #Se realiza la conexión a la base de datos
        cursor = conexion.cursor(dictionary=True) #Se realiza un cursos que devuelve un diccionario como resultado
        cursor.execute("""
            SELECT documento, nombres, apellidos, direccionCasa, 
                   ST_X(ubicacionCasa) AS latitudCasa, ST_Y(ubicacionCasa) AS longitudCasa, 
                   direccionTrabajo, ST_X(ubicacionTrabajo) AS latitudTrabajo, ST_Y(ubicacionTrabajo) AS longitudTrabajo,
                   ST_Distance_Sphere(ubicacionCasa, ubicacionTrabajo) / 1000 AS distancia_km
            FROM usuarios
        """) #Se ejecuta una consulta de Mysql con los campos de la tabla usuario
        usuarios = cursor.fetchall() #El cursor trae todos los datos de los campos de la consulta
        
        return jsonify(usuarios), 200 #Si devuelve la lista de usuarios manda mensaje JSON 200
    except Exception as e:
        print(f"Error al listar usuarios: {e}") #Si ocurre un error se manda un mensaje con error al listar usuarios
        return jsonify({"message": "Error al listar usuarios"}), 500 #Si hay un error se devuelve un mensaje JSON en error al listar usuarios 500
    finally:
        cursor.close() #Se cierra la conexión del cursor
        conexion.close() #Se cierra la conexión de la base de datos

@app.route('/delete/<int:documento>', methods=['DELETE']) #Se realiza el metodo Delete con la ruta /delete/<int:documento>
def eliminar_usuario(documento): #Se define el metodo como eliminar_usuario
    try:
        conexion = obtener_conexion() #Se realiza la conexión a la base de datos
        cursor = conexion.cursor() #Se realiza la conexión al cursor
        cursor.execute("DELETE FROM usuarios WHERE documento = %s", (documento,)) #Se ejecuta el cursor de eliminar con el documento del usuario
        conexion.commit() #Se confirman los datos a eliminar
        return jsonify({"message": "Usuario eliminado exitosamente"}), 200 #Si sale corrrectamente se manda un mensaje JSON 200 con usuario eliminado exitosamente
    except Exception as e:
        print(f"Error al eliminar usuario: {e}")
        return jsonify({"message": "Error al eliminar el usuario"}), 500 #si sale error se manda un mensaje JSON 500 con error al eliminar usuario
    finally:
        cursor.close() #Se cierra el cursor
        conexion.close() #Se cierra la conexión de la base de datos

if __name__ == '__main__':
    app.run(debug=True)
