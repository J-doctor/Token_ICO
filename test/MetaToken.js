const MetaToken = artifacts.require("MetaToken");
let meta;
let fromAccount, toAccount, spendingAccount;
contract("MetaToken", accounts => {
    it("initializes the contract with the correct values", function(){
        return MetaToken.deployed().then(instance => {
            meta = instance;
            return meta.name();
        })
        .then(name => {
            assert.equal(name, "MetaToken", "has the correct name");
            return meta.symbol();
        })
        .then(symbol => {
            assert.equal(symbol, "Meta", "has the correct symbol");
            return meta.standard();
        })
        .then(standard => {
            assert.equal(standard, "MetaToken v1.0", "has the correct standard");
        })
    })
    it("allocates the total supply upon deployment", () =>
      MetaToken.deployed()
        .then(instance => {
            meta = instance;
            return meta.totalSupply();
        })
        .then(totalSupply => {
          assert.equal(
            totalSupply.toNumber(),
            1000000,
            "sets the total supply to 1,000,000"
          );
          return meta.balanceOf(accounts[0]);
        })
        .then(adminBalance => {
            assert.equal(
                adminBalance.toNumber(),
                1000000,
                "it allocates the initial supply to the admin account"
            );
        })
        );
    it("transfers the ownership", function(){
        return MetaToken.deployed().then(instance => {
            meta = instance;
            return meta.transfer.call(accounts[1], 999999999999999999999999);
        }).then(assert.fail).catch(error => {
            assert(error.message, 'error message must contain revert');
            return meta.transfer.call(accounts[1], 250000, { from : accounts[0]});   
        })
        .then(success => {
            assert.equal(success, true, 'it returns true');
            return meta.transfer(accounts[1], 250000, { from : accounts[0]});
        })
        .then(receipt => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return meta.balanceOf(accounts[1]);
        }).then(balance => {
            assert.equal(balance.toNumber(), 250000, "adds the amount to the receiving account");
            return meta.balanceOf(accounts[0]);
        })
        .then(balance => {
            assert.equal(balance.toNumber(), 750000, "deducts the amount from the sending account");
        })
    });

    it('approve tokens for delegated transfer', function(){
        return MetaToken.deployed().then(instance => {
            meta = instance;
            return meta.approve.call(accounts[1], 100);
        })
        .then(success => {
            assert.equal(success, true, 'it returns true');
            return meta.approve(accounts[1], 100, { from : accounts[0] });
        })
        .then(receipt => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approve" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return meta.allowance(accounts[0], accounts[1]);
        })
        .then(allowance => {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
        })
    });

    it('handles delegated token transfer', function(){
        return MetaToken.deployed().then(instance => {
            meta = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return meta.transfer(fromAccount, 100, { from : accounts[0]});
        })
        .then(receipt => {
            return meta.approve(spendingAccount, 10, { from : fromAccount});
        })
        .then(receipt => {
            return meta.transferFrom(fromAccount, toAccount, 9999, { from : spendingAccount });
        }).then(assert.fail).catch(error => {
            assert(error.message, 'cannot transfer value larger than balance');
            return meta.transferFrom(fromAccount, toAccount, 20, { from : spendingAccount });
        }).then(assert.fail).catch(error => {
            assert(error.message, 'cannot transfer value larger than allowance');
            return meta.transferFrom.call(fromAccount, toAccount, 10, { from : spendingAccount });
        }).then(success => {
            assert.equal(success, true, 'it returns true');
            return meta.transferFrom(fromAccount, toAccount, 10, { from : spendingAccount });
        }).then(receipt => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
            return meta.balanceOf(fromAccount);
        }).then(balance => {
            assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
            return meta.balanceOf(toAccount);
        }).then(balance => {
            assert.equal(balance.toNumber(), 10, 'adds the amount to the receiving account');
            return meta.allowance(fromAccount, spendingAccount);
        }).then(allowance => {
            assert.equal(allowance.toNumber(), 0 , 'deducts the amount from the allowance');
        })
    })
});