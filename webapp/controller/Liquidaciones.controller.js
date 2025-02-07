sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/ui/core/Core",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/TextArea"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Dialog, Library, Core, Button, Label, TextArea) {
        "use strict";
        return Controller.extend("enap.com.zapp_hr_get_liq.controller.Liquidaciones", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteLiquidaciones").attachMatched(this.onRouteMatched, this);
                this.setViewModels();
                this.setCollectionsToModel();
            },
            onRouteMatched: function () {
                this.getDataColaborador();
            },
            getViewModel: function (sModel) {
                if (sModel === "") {
                    return this.getView().getModel();
                } else {
                    return this.getView().getModel(sModel);
                }
            },
            setViewModels: function () {
                // Modelo por defecto en Odata
                this.oModel = this.getOwnerComponent().getModel();
                this.getView().setModel(this.oModel);
                // Modelo JSon
                this.getView().setModel(new JSONModel(), "oViewModel");
                this.getView().setModel(this.getOwnerComponent().getModel('device'), "oDevice");
            },
            getYearCollection: function () {
                const yearCollection = [];
                const anioActual = new Date().getFullYear(); // Obtener el año actual

                for (let i = 0; i < 10; i++) {
                    const anio = anioActual - i;
                    const item = {
                        "Number": anio.toString(),
                        "Name": anio.toString()
                    };
                    yearCollection.push(item);
                }

                return yearCollection;
            },
            getMonthCollection: function () {
                const aMonthArray = [
                    {
                        "Number": "01",
                        "Name": "Enero"
                    },
                    {
                        "Number": "02",
                        "Name": "Febrero"
                    },
                    {
                        "Number": "03",
                        "Name": "Marzo"
                    },
                    {
                        "Number": "04",
                        "Name": "Abril"
                    },
                    {
                        "Number": "05",
                        "Name": "Mayo"
                    },
                    {
                        "Number": "06",
                        "Name": "Junio"
                    },
                    {
                        "Number": "07",
                        "Name": "Julio"
                    },
                    {
                        "Number": "08",
                        "Name": "Agosto"
                    },
                    {
                        "Number": "09",
                        "Name": "Septiembre"
                    },
                    {
                        "Number": "10",
                        "Name": "Octubre"
                    },
                    {
                        "Number": "11",
                        "Name": "Noviembre"
                    },
                    {
                        "Number": "12",
                        "Name": "Diciembre"
                    }
                ];
                return aMonthArray;
            },
            setCollectionsToModel: function () {
                var oData = {
                    "Personal": {},
                    "urlPdf": "",
                    "selectedYear": (new Date().getFullYear()).toString(),
                    "selectedMonth": (new Date().getMonth() + 1).toString().padStart(2, "0"),
                    "YearCollection": this.getYearCollection(),
                    "MonthCollection": this.getMonthCollection(),
                    "bActiveButtons": false
                };
                this.getViewModel("oViewModel").setData(oData);
            },
            onPressMinusMonth: function (oEvent) {
                let iYear = parseInt(this.getViewModel("oViewModel").getProperty("/selectedYear"), 10);
                let iMonth = parseInt(this.getViewModel("oViewModel").getProperty("/selectedMonth"), 10);
                if (iMonth === 1) {
                    iMonth = 12;
                    iYear--;
                    this.getViewModel("oViewModel").setProperty("/selectedYear", iYear.toString());
                } else {
                    iMonth--;
                }
                this.getViewModel("oViewModel").setProperty("/selectedMonth", iMonth.toString().padStart(2, "0"));
                this.getPdfLiquidacion();
            },
            onPressAddMonth: function (oEvent) {
                let iYear = parseInt(this.getViewModel("oViewModel").getProperty("/selectedYear"), 10);
                let iMonth = parseInt(this.getViewModel("oViewModel").getProperty("/selectedMonth"), 10);
                if (iYear < (new Date().getFullYear())) {
                    if (iMonth === 12) {
                        iYear++;
                        this.getViewModel("oViewModel").setProperty("/selectedYear", iYear.toString());
                    }
                }
                if (iMonth < 12) {
                    iMonth++;
                } else {
                    iMonth = 1;
                }
                this.getViewModel("oViewModel").setProperty("/selectedMonth", iMonth.toString().padStart(2, "0"));
                this.getPdfLiquidacion();
            },
            getDataColaborador: function () {
                var pBuscarColaborador = new Promise(
                    function (resolve, reject) {
                        this.oModel.read("/PersonalSet", {
                            "success": function (oData, response) {
                                resolve(oData.results);
                            }.bind(this),
                            "error": function (oError) {
                                console.log("No existe como coloborador");
                                reject(oError);
                            }
                        });
                    }.bind(this)
                );
                pBuscarColaborador.then(
                    function (oData) {
                        if (Array.isArray(oData)) {
                            const oPersonal = {
                                Pernr: oData[0].Pernr,
                                Nachn: oData[0].Nachn,
                                Name2: oData[0].Name2,
                                Nach2: oData[0].Nach2,
                                Vorna: oData[0].Vorna,
                                Midnm: oData[0].Midnm
                            };

                            this.getViewModel("oViewModel").setProperty("/Personal", oPersonal);
                            this.getPdfLiquidacion();
                            /* const sYear = this.getViewModel("oViewModel").getProperty("/selectedYear");
                            const sMonth = this.getViewModel("oViewModel").getProperty("/selectedMonth");
                            const sPath = this.oModel.createKey('/FilePdfSet', {
                                "Pernr": oPersonal.Pernr,
                                "Year": sYear,
                                "Month": sMonth
                            });
                            let sUrl = this.oModel.sServiceUrl + sPath + "/$value"
                            this.getViewModel("oViewModel").setProperty("/urlPdf", sUrl); */
                        }
                    }.bind(this),
                    function (oError) {
                        sap.m.MessageBox.error("No existe como coloborador");
                    }
                );
            },
            getPdfLiquidacion: function () {
                const oPersonal = this.getViewModel("oViewModel").getProperty("/Personal");
                if (!oPersonal.Pernr) {
                	sap.m.MessageToast.show("Nº Colaborador esta en blanco");
                    return;
                }
                const sYear = this.getViewModel("oViewModel").getProperty("/selectedYear");
                const sMonth = this.getViewModel("oViewModel").getProperty("/selectedMonth");
                const sPath = this.oModel.createKey('/FilePdfSet', {
                    "Pernr": oPersonal.Pernr,
                    "Year": sYear,
                    "Month": sMonth
                });
                let sUrl = this.oModel.sServiceUrl + sPath + "/$value"
                this.getViewModel("oViewModel").setProperty("/urlPdf", sUrl);
                var pBuscarAprobacion = new Promise(
                    function (resolve, reject) {
                        const sPathAprobacion = this.oModel.createKey('/AprobacionSet', {
                            "Pernr": oPersonal.Pernr,
                            "Year": sYear,
                            "Month": sMonth
                        });
                        this.oModel.read(sPathAprobacion, {
                            "success": function (oData) {
                                resolve(oData);
                            }.bind(this),
                            "error": function (oError) {
                                console.log("No hay registro de aprobacion");
                                reject(oError);
                            }
                        });
                    }.bind(this)
                );
                pBuscarAprobacion.then(
                    function (oData) {
                        if (oData.Accion === 'APROBADA' || oData.Accion === 'OBSERVADA') {
                            this.getViewModel("oViewModel").setProperty("/bActiveButtons", false);
                        } else {
                            this.getViewModel("oViewModel").setProperty("/bActiveButtons", true);
                        }
                    }.bind(this),
                    function (oError) {
                        this.getViewModel("oViewModel").setProperty("/bActiveButtons", true);
                    }
                );
            },
            onChangeSelectMonth: function (oEvent) {
                this.getPdfLiquidacion();
            },
            onChangeSelectYear: function (oEvent) {
                this.getPdfLiquidacion();
            },
            onButtonPressAceptar: function (oEvent) {
                this.enviarAprobacion({ "accion": "APROBAR", "observacion": "" });
            },
            onButtonPressObservar: function (oEvent) {
                // shortcut for sap.m.DialogType
                var DialogType = Library.DialogType;
                // shortcut for sap.m.ButtonType
                var ButtonType = Library.ButtonType;
                if (!this.oSubmitDialog) {
                    this.oSubmitDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Enviar la Observación",
                        content: [
                            new Label({
                                text: "Observación",
                                labelFor: "submissionNote"
                            }),
                            new TextArea("submissionNote", {
                                width: "100%",
                                placeholder: "Escriba su Observación aquí, es requerido",
                                liveChange: function (oEvent) {
                                    var sText = oEvent.getParameter("value");
                                    this.oSubmitDialog.getBeginButton().setEnabled(sText.length >= 10);
                                }.bind(this)
                            })
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Enviar",
                            enabled: false,
                            press: function () {
                                var sTextObservacion = Core.byId("submissionNote").getValue();
                                this.enviarAprobacion({ "accion": "OBSERVAR", "observacion": sTextObservacion });
                                this.oSubmitDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: function () {
                                this.oSubmitDialog.close();
                            }.bind(this)
                        })
                    });
                }

                this.oSubmitDialog.open();
            },
            enviarAprobacion: function (oParametros) {
                const oPersonal = this.getViewModel("oViewModel").getProperty("/Personal");
                const sYear = this.getViewModel("oViewModel").getProperty("/selectedYear");
                const sMonth = this.getViewModel("oViewModel").getProperty("/selectedMonth");
                if (!oPersonal.Pernr) {
                    return;
                }
                var pAprobarLiq = new Promise(function (resolve, reject) {
                    const oAprobacion = {
                        Pernr: oPersonal.Pernr,
                        Year: sYear,
                        Month: sMonth,
                        Accion: oParametros.accion,
                        Obs: oParametros.observacion
                    };
                    this.oModel.create("/AprobacionSet", oAprobacion, {
                        "success": function (oData, response) {
                            resolve(oData);
                        }.bind(this),
                        "error": function (oError) {
                            console.log("No existe como coloborador");
                            reject(oError);
                        }
                    });
                }.bind(this)
                );
                pAprobarLiq.then(
                    function (oData) {
                        this.getViewModel("oViewModel").setProperty("/bActiveButtons", false);
                        sap.m.MessageBox.success("Información Enviada con exito");
                    }.bind(this),
                    function (oError) {
                        this.getViewModel("oViewModel").setProperty("/bActiveButtons", false);
                        sap.m.MessageBox.error("Al enviar información");
                    }
                );
            }
        });
    });
