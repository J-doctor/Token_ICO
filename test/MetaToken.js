const MetaToken = artifacts.require("MetaToken");
contract("MetaToken", accounts => {
    it("sets the total supply upon deployment", () =>
      MetaToken.deployed()
        .then(instance => instance.totalSupply())
        .then(totalSupply => {
          assert.equal(
            totalSupply.toNumber(),
            1000000,
            "sets the total supply to 1,000,000"
          );
        }));
})