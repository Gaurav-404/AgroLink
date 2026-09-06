export interface Request{
    RequestId?:number;
    AgroChemicalId:number;
    UserId:number;
    CropId:number;
    Quantity:number;
    Status:string;
    RequestDate:string;
}