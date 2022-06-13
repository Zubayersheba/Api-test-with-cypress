const { it } = require("mocha")
//<referece types ="Cypress" />

/*
Test case : Call due list api where user will find the customer list who has due balance
Steps : Create contact then create a due entry with 10taka amount then call due list api
Expected : Specific customer will appear and due balance will be found 
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
    it('Call due list api to get the created customer list and get due balance of that customer. Expected : due balance of that customer will be 10 and balance type will be account_receivable', () => {
        cy.request({
            method: 'GET',
            url: api_url + '/v3/accounting/due-tracker/due-list?contact_type=customer',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },

        }).then((res) => {
            //cy.log(JSON.stringify(res.body.data.list[0].contact_id));
            expect(res.body.message).to.eq("Successful");
            expect(res.body.data.list[0].contact_id).to.eq(contact_id);
            expect(res.body.data.list[0].balance).to.eq(10);
            expect(res.body.data.list[0].balance_type).to.eq("account_receivable");
        })

    })
    it('Create Deposit entry for customer', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "deposit",
                account_key: "cash",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.status).to.eq(201);

        })
    });

    it('Call due list api to get the created customer list after creating due and get balance of that customer. Expected : As same due amount is deposited balance type will be cleared for that customer', () => {
        cy.request({
            method: 'GET',
            url: api_url + '/v3/accounting/due-tracker/due-list?contact_type=customer',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },

        }).then((res) => {
            //cy.log(JSON.stringify(res.body.data));
            expect(res.body.message).to.eq("Successful");
            expect(res.body.data.list[0].contact_id).to.eq(contact_id);
            expect(res.body.data.list[0].balance).to.eq(0);
            expect(res.body.data.list[0].balance_type).to.eq("cleared");
        })

    })
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
    it('Create Deposit entry for customer with less tham due amount. Steps -> if customer due is 10 taka then deposit 5 taka.', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 5,
                source_type: "deposit",
                account_key: "cash",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.status).to.eq(201);

        })
    });
    it('Call due list api to get the created customer list after creating deposit and get balance of that customer. Expected : due 5 wil be deducted by deposit balance and balance type will be 5taka due', () => {
        cy.request({
            method: 'GET',
            url: api_url + '/v3/accounting/due-tracker/due-list?contact_type=customer',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },

        }).then((res) => {
            cy.log(JSON.stringify(res.body.data));
            expect(res.body.message).to.eq("Successful");
            expect(res.body.data.list[0].contact_id).to.eq(contact_id);
            expect(res.body.data.list[0].balance).to.eq(5);
            expect(res.body.data.list[0].balance_type).to.eq("account_receivable");
        })

    })



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