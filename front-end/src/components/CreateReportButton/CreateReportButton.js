// src/components/ScreenshotButton.js
import React, { useState } from "react";
import CustomButton from "../global/CustomButton";
import { useInforme } from "../../utils/informe/useInforme";
import { useApp } from "../../context/AppContext";


const CreateReportButton = () => {

  const { generarInformeBasico } = useInforme();
  const { aortaData, ostiumReferenceNodes } = useApp(); //Importación de los datos de la aorta y los nodos de referencia.


  const [isGenerating, setIsGenerating] = useState(false);


  //Condición para verificar si los datos necesarios están listos antes de mostrar el menú
  const isDataReady = aortaData?.p_cent && aortaData?.n_ref &&
    Array.isArray(ostiumReferenceNodes) && ostiumReferenceNodes.length >= 2;

  const createInformeBasico = async () => {
    setIsGenerating(true);
    try {
      await generarInformeBasico();
      console.log("Informe básico generado correctamente.");
    } catch (error) {
      console.error("Error al generar el informe básico:", error);
    }finally{
      setIsGenerating(false);
    }
  }

  return (
    <CustomButton
      onClick={createInformeBasico}
      text={isGenerating ? "Generando informe..." : "Crear informe"}
      disabled={!isDataReady || isGenerating}
      title={!isDataReady ? 'Vistas para creación informe no disponibles' : ''}></CustomButton>
  );
};

export default CreateReportButton;
