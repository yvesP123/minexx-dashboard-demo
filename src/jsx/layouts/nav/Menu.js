export const RootMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },
 
    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },
    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title: 'Trace Report',
                to: 'reports/trace',
            },
            {
                title:'Kyc Summary',
                to:'reports/kycsummary'
            },
            {
            title:'Supplier Sales Report',
            to:'reports/sale',
            },
            {
                title:'Supplier Delivery Trend',
                to:'reports/suppliertrends',
            },
            {
                title:'Trade Time Report',
                to:'reports/timetracking',
            }, 
            {
                title: 'Total Stock Delivery',
                to: 'reports/daily',
            },
            {
                title: 'In-Stock Country Balance',
                to: 'reports/mtd',
            },
            {
                title: 'Total Purchase',
                to: 'reports/deliveries',
            },
        ]

    },
    // Users
    {
        title: 'User Management',
        class: 'mm-collapse',
        iconStyle: <i className="flaticon-settings-1"></i>,
        content: [
            {
                title: 'Dashboard Users',
                to: '/users/dashboard',
            },
            {
                title: 'App Users',
                to: '/users/app',
            }
        ]
    }    
]

export const RegulatorMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },

    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title: 'Trace Reports',
                to: 'reports/trace',
            },
            {
                title:'Kyc Summary',
                to:'reports/kycsummary'
            },
            {
                title:'Supplier Sales Report',
                to:'reports/sale',
            },
            {
                title:'Supplier Delivery Trend',
                to:'reports/suppliertrends',
            },
            {
                title:'Trade Time Report',
                to:'reports/timetracking',
            }, 
            {
                title: 'Total Stock Delivery',
                to: 'reports/daily',
            },
            {
                title: 'In-Stock Country Balance',
                to: 'reports/mtd',
            },
            {
                title: 'Total Purchase',
                to: 'reports/deliveries',
            },
        ]

    }
]

export const BMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    }
]

export const IMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },

    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title: 'Trace Report',
                to: 'reports/trace',
            },
            {
                title:'Kyc Summary',
                to:'reports/kycsummary'
            },
            {
                title:'Supplier Sales Report',
                to:'reports/sale',
            },
            {
                title:'Supplier Delivery Trend',
                to:'reports/suppliertrends',
            },
            {
                title:'Trade Time Report',
                to:'reports/timetracking',
            }, 
            {
                title: 'Total Stock Delivery',
                to: 'reports/daily',
            },
            {
                title: 'In-Stock Country Balance',
                to: 'reports/mtd',
            },
            {
                title: 'Total Purchase',
                to: 'reports/deliveries',
            },
        ]

    }
]