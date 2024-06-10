export interface PlantsInterface {
    id_plant: number;
    name_plant: string;
    inicio_contrato: Date;
    fin_contrato: Date;
    cmd: number;
    unidad: string;
    id_client?: number;
    editing?: boolean;    
}