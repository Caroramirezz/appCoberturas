import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import { ChartData, ChartOptions } from 'chart.js';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EChartsOption  } from 'echarts';


@Component({
  selector: 'app-dashboard-finanzas',
  templateUrl: './dashboard-finanzas.component.html',
  styleUrls: ['./dashboard-finanzas.component.scss']
})
export class DashboardFinanzasComponent implements OnInit {

  //Cards
  fechaInicio = moment().startOf('month').toDate();
  fechaFin = moment().endOf('month').toDate();
  pedientes_pagar:number = 0;
  pagadas:number = 0;
  total_solicitudes = 0;


  //PIE CHART 
  // Pie
  public lineChartType = "pie";
  public pieChartOptions: ChartOptions= {
    responsive: true,    
    // plugins: {
    //   tooltip: {
    //       callbacks: {
    //           label: function(context:any) {
    //               let label = context.dataset.label || '';

    //               if (label) {
    //                   label += ': ';
    //               }
    //               if (context.parsed.y !== null) {
    //                   label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
    //               }
    //               return label;
    //           }
    //       }
    //   }
    // },
    plugins: {      
      datalabels: {
        formatter: function(value:any, context:any) {
          return context.chart.data.labels[context.dataIndex];
        }
      }
    }       
  };


  PieChartOption:EChartsOption = { };    
  chartOption: EChartsOption = { };


  public pieChartLabels = [ 'Download Sales ', 'In Store Sales', 'Mail Sales' ];
  public pieChartDatasets = [ {
    data: [100.10, 200, 300]
  } ];
  public pieChartLegend = true;
  public pieChartPlugins = [];


  constructor(
    private dashService:DashboardService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService, 
  ) { }

  ngOnInit(): void {
    this.consultarTarjetas();
    this.consultarSolicitudesPorMes();
    this.consultarSolicitudesTipoMoneda();
  } 
  //Esta funcion consulta todo el historial de solicitudes del mes actual. 
  consultarTarjetas(){

    this.spinner.show();

    let fechaInicio = moment(this.fechaInicio).toDate();
    let fechaFin = moment(this.fechaFin).toDate();

    //Primero hay que traer el token de Alliax
    this.dashService.consultarSolicitudes(fechaInicio, fechaFin).subscribe(result => {
      console.log(result);
      if(result.length > 0){

        for(var x = 0; x < result.length; x++){
          if(result[x].fechaPago === '1900-01-01T00:00:00'){
            result[x].fechaPago = null;
            result[x].pagado = 'Sin Pagar';
          }
        }               

        this.hacerConteoCards(result);
        this.consultarSolicitudesTipoMoneda();

        this.spinner.hide();
      }
      else {
        this.toastr.error('No hay información en este rango fechas', '', {
          timeOut: 5000,
        });
        this.spinner.hide();
      }
      this.spinner.hide();
    }, error => {
      this.toastr.error(error.error, '', {
        timeOut: 5000,
      });
      this.spinner.hide();
    })

  }


  //Teniendo el resultado de las solicitudes de acuerdo al filtro; separar
  hacerConteoCards(data:any){

    let auxSinPagar = 0;
    let auxPagadas = 0;

    for(var x = 0; x < data.length; x++){
      if(data[x].fechaPago === null && data[x].pagado === 'Sin Pagar'){
        auxSinPagar++;
      }
      
      if(data[x].fechaPago != null && data[x].pagado === 'Pagada'){
        auxPagadas++
      }
    }

    this.total_solicitudes = data.length
    this.pedientes_pagar = auxSinPagar;
    this.pagadas = auxPagadas;
  }


  consultarSolicitudesPorMes(){
    this.spinner.show();

    let fechaInicio = moment().startOf('year').toDate();
    let fechaFin = moment().endOf('year').toDate();

    this.dashService.consultarSolicitudesPorMes(fechaInicio, fechaFin).subscribe(res => {      
      console.log(res);   
      
      let dataNew = [];
      let labelsNew = [];

      for(var x = 0; x < res.length; x++){
        labelsNew.push(res[x].mes_creacion);
        dataNew.push(res[x].num_solicitudes);
      }

      this.chartOption = {
        // title:{
        //   text:'Solicitudes por Mes',
        //   left:'1%'
        // },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: labelsNew
        },
        yAxis: {
          type: 'value',
        },
        series: [          
          {
            data: dataNew,
            type: 'line',
            name: 'Solicitudes',                
          },
        ],
      };
      this.spinner.hide();
    }, error => {
      this.toastr.error(error.error, '', {
        timeOut: 5000,
      });
      this.spinner.hide();
    })
  }

  consultarSolicitudesTipoMoneda(){
    this.spinner.show();

    let fechaInicio = moment(this.fechaInicio).toDate();
    let fechaFin = moment(this.fechaFin).toDate();

    this.dashService.consultarMontosPorMoneda(fechaInicio, fechaFin).subscribe(result => {      
      console.log(result);     

      let dataNew =[{}];
      
      // this.pieChartLabels = [];
      // this.pieChartDatasets = [{data:[]}];
      // for(var x = 0; x < res.length; x++){

      //   let price = res[x].total;
      //   // Format the price above to USD using the locale, style, and currency.
      //   let USDollar = new Intl.NumberFormat('en-US', {
      //     style: 'currency',
      //     currency: 'USD',
      //   });      
      //   let precioString = USDollar.format(price)
      //   // The formated version of 14340 is $14,340.00

      //   //let precioMostrar = new Intl.NumberFormat('en-US').format(price); // 143,450
        
      //   let label = new DecimalPipe('en').transform(res[x].total);
        

      //   this.pieChartLabels.push(res[x].moneda);
      //   this.pieChartDatasets[0].data.push(res[x].total);
      // }

      for(var x = 0; x < result.length; x++){
        dataNew.push(
          {
            value: result[x].total,
            name: result[x].moneda
          }
        );
      }


      this.PieChartOption= { 
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'horizontal',
          left: 'center'
        },
        series: [
          {
            name: 'Monto($)',
            type: 'pie',
            radius: '60%',
            data: dataNew,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      
      // this.pieChartLabels = [ 'Download Sales ', 'In Store Sales', 'Mail Sales' ];
      // this.pieChartDatasets = [ {
      //   data: [ 300, 500, 100 ]
      // } ];      

      this.spinner.hide();
    }, error => {
      this.toastr.error(error.error, '', {
        timeOut: 5000,
      });
      this.spinner.hide();
    })
  }


}
