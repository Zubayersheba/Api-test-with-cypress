const { it } = require("mocha")
//<referece types ="Cypress" />

/*
Test case : Create contact and then create a due entry
Expected : Entry will be created and statuscode will be 200
*/

//Data set for create contact//
let contactMobile = (Cypress.env('contact_Mobile'))
let contactName = (Cypress.env('contact_Name'))
let api_url = (Cypress.env('api_url'))

//Data set for login//
let account_api_url = (Cypress.env('accounts_api_url'))
let testMobile = (Cypress.env('test_Mobile'))
let testPassword = (Cypress.env('test_Password'))
let jwtToken
let contact_id

describe('Create contact', () => {

    before('Login with pre-registered user and store jwtToken to create contact', () => {
        cy.request({

            method: 'POST',
            url: account_api_url + '/api/v3/profile/login',
            //headers : {}
            body: {
                mobile: testMobile,
                password: testPassword,
                created_from: "due_tracker"
            }

        }).then((res) => {
            jwtToken = res.body.token;  //store jwtToken  
        })

    });

    it('Create contact and store customer id', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/pos/v1/customers',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                mobile: contactMobile,
                name: contactName
            }
        }).then((res) => {
            contact_id = res.body.customer.id //store customer id

        })
    });

    it('Create Due entry for customer', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.status).to.eq(201);

        })
    });
    it('Create Due entry for customer -> send string instead of int value in amount.Result : entry will be created with given amount', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: "10",
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.data.amount));
            expect(res.status).to.eq(201);
            expect(res.body.data.amount).to.eq(10);

        })
    });
    it('Create Due entry for customer -> send wrong source type for source_type key.Expected : code will 400 & message will "The selected source type is invalid."', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "wrongsourcetype",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.message));
            expect(res.body.code).to.eq(400);
            expect(res.body.message).to.eq("The selected source type is invalid.");

        })
    });
    it('Create Due entry for customer -> Call post api without amount which is a mandatory field. Expected : "code": 400 & "message": "The amount field is required."', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: "",
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.message));
            expect(res.body.code).to.eq(400);
            expect(res.body.message).to.eq("The amount field is required.");

        })
    });
    it('Create Due entry for customer -> Call post api without source_type which is a mandatory field. Expected : "code": 400 & "message": "The source type field is required."', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.message));
            expect(res.body.code).to.eq(400);
            expect(res.body.message).to.eq("The source type field is required.");

        })
    });
    it('Create Due entry for customer -> Call post api without contact_type which is a mandatory field. Expected : "code": 400 & "message": "The contact type field is required."', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.message));
            expect(res.body.code).to.eq(400);
            expect(res.body.message).to.eq("The contact type field is required.");

        })
    });
    it('Create Due entry for customer -> Call post api without contact_id which is a mandatory field. Expected : "code": 400 & "message": "The contact id field is required."', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: "",
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.message));
            expect(res.body.code).to.eq(400);
            expect(res.body.message).to.eq("The contact id field is required.");

        })
    });
    it('Create Due entry for customer -> Call post api with wrong contact_id which do not belongs to this partner. Expected : "code": 500', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: "258",
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.message));
            expect(res.body.code).to.eq(500);
            //expect(res.body.message).to.eq("The contact id field is required.");

        })
    });
    it('Create Due entry for customer -> Call post api with empty entry_at mandatory field. Expected : "code": 400 & message : "The entry at field is required."', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: ""

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body.message));
            expect(res.body.code).to.eq(400);
            expect(res.body.message).to.eq("The entry at field is required.");

        })
    });
    it('Create Due entry for customer -> Call post api with future date in entry_at field. Expected : "code": 200 & Entry will be created', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-08-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            //expect(res.body.code).to.eq(200);
            expect(res.body.data.amount).to.eq(10);

        })
    });



    after('Delete the contact after each test case execution', () => {
        cy.request({

            method: 'DELETE',
            url: api_url + '/pos/v1/customers/' + contact_id,
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }

        }).then((res) => {
            expect(res.status).to.eq(200);


        })


    });


})