import React from "react";
import vtkSTLReader from 'vtk.js/Sources/IO/Geometry/STLReader';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import CustomCheckbox from "../global/CustomCheckbox/CustomCheckbox";

const BtnToggleCalcium = ({
    calciumPath,
    calciumActive,
    setCalciumActive,
    stlActor,
    setStlActor,
    rendererRef,
    renderWindowRef,
}) => {

    const handleToggle = () => {
        const renderer = rendererRef.current;
        const renderWindow = renderWindowRef.current;

        // Si está activo, lo quitamos del renderer
        if (calciumActive && stlActor) {
            renderer.removeActor(stlActor);
            setCalciumActive(false);
            renderWindow.render();
            return;
        }

        // Si ya está cargado, simplemente lo volvemos a añadir
        if (stlActor) {
            renderer.addActor(stlActor);
            setCalciumActive(true);
            renderWindow.render();
            return;
        }

        // Si aún no está cargado, entonces lo cargamos desde el servidor
        console.log("Cargando modelo STL de calcio...");
        const fileName = `http://127.0.0.1:5000/api/models/${calciumPath}`;
        if (!fileName) return;

        const stlReader = vtkSTLReader.newInstance();
        stlReader.setUrl(fileName).then(() => {
            const polydata = stlReader.getOutputData();
            const numPoints = polydata.getPoints().getNumberOfPoints();
            const scalars = new Float32Array(numPoints).fill(1.0);

            const scalarDataArray = vtkDataArray.newInstance({
                numberOfComponents: 1,
                values: scalars,
            });
            scalarDataArray.setName('Scalars');
            polydata.getPointData().setScalars(scalarDataArray);

            const mapper = vtkMapper.newInstance();
            mapper.setInputData(polydata);

            const stlActorInstance = vtkActor.newInstance();
            stlActorInstance.setMapper(mapper);

            const lookupTable = vtkColorTransferFunction.newInstance();
            lookupTable.addRGBPoint(1.0, 1.0, 0.686, 0.137); // amarillo cálido

            mapper.setLookupTable(lookupTable);
            mapper.setColorModeToMapScalars();
            mapper.setScalarRange(1.0, 1.0);

            renderer.addActor(stlActorInstance);
            setStlActor(stlActorInstance);
            setCalciumActive(true);
            renderWindow.render();
        }).catch((error) => {
            console.error("Error cargando STL:", error);
        });
    };


    return (
        <CustomCheckbox
            id="toggle-calcium"
            checked={calciumActive}
            onChange={handleToggle}
            label="Calcio"
            title="Alternar visibilidad del modelo de calcio"
        />
    );
};

export default BtnToggleCalcium;
