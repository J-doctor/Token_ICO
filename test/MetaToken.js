const MetaToken = artifacts.require("MetaToken");
let meta;
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
    })
})