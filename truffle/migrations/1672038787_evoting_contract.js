const EvotingContract = artifacts.require("EvotingContract");

module.exports = function(_deployer) {
    _deployer.deploy(EvotingContract, ["Jokowi", "Prabowo", "Anies"]);
};