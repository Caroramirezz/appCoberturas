export interface Menu {    
    icon?:string;
    title:string;    
    link?:string;
    children?: Menu[];
    iconPath?: string;
    customClass?: string;
}