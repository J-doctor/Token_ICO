pragma solidity ^0.8.0;

contract MetaToken{
    
    string public name = "MetaToken";
    string public symbol = "Meta";
    string public standard = "MetaToken v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply){
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns(bool success){

        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        //emit transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}