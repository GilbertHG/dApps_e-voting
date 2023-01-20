// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract EvotingContract {

    struct Voter {
        uint vote;
        bool voted;
        uint weight;
        address voterAddress;
    }

    struct Candidate {
        string name;
        uint voteCount;
    }

    address public chairperson;

    mapping(address => Voter) public voters;
    address[] public voterAddresses;

    Candidate[] public candidates;

    constructor(string[] memory candidateNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for(uint i=0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }

    /**
     * @dev Add candidate.
     * @param candidateName the name of candidate
     */
    function addCandidate(string memory candidateName) public returns (Candidate[] memory) {
        require(
            msg.sender == chairperson,
            "Only chairperson can add new candidate."
        );

        candidates.push(Candidate({
            name: candidateName,
            voteCount: 0
        }));
        return candidates;
    }

    /**
     * @dev Removes candidate.
     * @param candidateIndex the index of candidate
     */
     function removeCandidate(uint candidateIndex) public returns (Candidate[] memory) {
        candidates[candidateIndex] = candidates[candidates.length - 1];
        candidates.pop();

        return candidates;
     }

    /**
     * @dev Removes all candidates.
     */
     function removeCandidates() public returns (Candidate[] memory) {
         delete candidates;
         return candidates;
     }

    /**
     * @dev Get all voters.
     * @return the list of voters
     */
    function getListVoters() public view returns (Voter[] memory){
        uint voterAddressesCount = voterAddresses.length;
        Voter[] memory ret = new Voter[](voterAddressesCount);

        for (uint i = 0; i < voterAddressesCount; i++) {
            ret[i] = voters[voterAddresses[i]];
        }
        return ret;
    }

    /**
     * @dev Add voter.
     * @param voter address of voter
     */
    function addVoters(address voter) public {
        // validation
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            !voters[voter].voted,
            "The voter already voted"
        );
        require(voters[voter].weight == 0);

        voters[voter].weight = 1;
        voters[voter].voterAddress = voter;
        voterAddresses.push(voter);
    }

    /**
     * @dev Give the vote to the candidate.
     * @param candidate the index of candidate in the candidates array
     */
    function vote(uint candidate) public returns (Candidate[] memory) {
        Voter storage sender = voters[msg.sender];

        // validation
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted");

        sender.voted = true;
        candidates[candidate].voteCount += sender.weight;
        return candidates;
    }

    /**
     * @dev Get the current votes.
     * @return the candidates array
     */
    function currentVotes() public view returns(Candidate[] memory) {
        return candidates;
    }

    /**
     * @dev Get the current winner name.
     * @return winnerName the winner name
     */
    function currentWinner() public view returns (string memory winnerName) {
        uint winningVoteCount = 0;
        winnerName =  "Tie";
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winnerName = candidates[i].name;
            } else if (candidates[i].voteCount == winningVoteCount) {
                winnerName = "Tie";
            }
        }
    }

}