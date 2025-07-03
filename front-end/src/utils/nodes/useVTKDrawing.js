import { useVTK } from "../../context/VTKContext";
import vtkPoints from '@kitware/vtk.js/Common/Core/Points.js';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData.js';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray.js';
import vtkSphereSource from "@kitware/vtk.js/Filters/Sources/SphereSource";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";


/**
 * Hook que permite crear y añadir una esfera (punto) a la escena VTK.
 */
export const useVTKDrawing = () => {
  const { rendererRef, renderWindowRef } = useVTK();

  /**
   * Crea y añade una esfera en el espacio 3D.
   * @param {Array<number>} position - Coordenadas [x, y, z]
   * @param {number} radius - Radio de la esfera
   * @param {Array<number>} color - RGB (valores de 0 a 1)
   * @returns {vtkActor} - El actor creado
   */
  const createPoint = (position, radius = 5, color = [1, 0, 0]) => {
    const sphereSource = vtkSphereSource.newInstance({
      center: position,
      radius,
      thetaResolution: 32,
      phiResolution: 32,
    });

    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(sphereSource.getOutputPort());

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().setColor(...color);

    // Añadir a la escena
    rendererRef.current.addActor(actor);
    renderWindowRef.current.render();

    return actor;
  };


    /**
   * Crea una línea 3D entre dos puntos.
   */
  const createLine = (point1, point2, color = [0, 0, 0]) => {
    const points = vtkPoints.newInstance();
    points.setData([...point1, ...point2], 3);

    const lines = vtkCellArray.newInstance({
      values: new Uint16Array([2, 0, 1]),
    });

    const polyData = vtkPolyData.newInstance();
    polyData.setPoints(points);
    polyData.setLines(lines);

    const mapper = vtkMapper.newInstance();
    mapper.setInputData(polyData);

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().setColor(...color);
    actor.getProperty().setLineWidth(7);

    rendererRef.current.addActor(actor);
    renderWindowRef.current.render();

    return actor;
  };

  return { createPoint, createLine };
};
