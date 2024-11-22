// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
    // Mapping to track the number of professors in a university
    mapping(address => uint256) public universityProfessors;

    // Mapping to associate a professor's address with their university
    mapping(address => address) public professorToUniversity;

    // Maximum number of professors allowed per university
    uint256 public constant CAP = 2;

    // Enum to represent the status of the presidential election
    enum VoteStatus { NO_ELECTION, IN_PROGRESS, CLOSED }

    // Variable to track the current election status
    VoteStatus public VOTE_STATUS;

    // Global variable to track the total number of universities
    uint256 public universityCount;

    // Global variable to track the election duration in blocks (not days)
    uint256 public electionDurationInBlocks;

    // Global variable to track the election end block number
    uint256 public electionEndBlock;

    // Fixed fee in wei for enrolling or unrolling (now 10 wei)
    uint256 public constant ENROLLMENT_FEE = 10; // 10 wei

    // Election start fee: 100 wei to start the election
    uint256 public constant ELECTION_START_FEE = 100; // 100 wei to start the election

    // Address of the university that started the election
    address public universityAddress;

    // Mapping to track which universities have voted
    mapping(address => bool) public universitiesVoted;

    // List of all university addresses (used to check voting status)
    address[] public universities;

    // Event to log when a university votes
    event UniversityVoted(address indexed university);

    // Events to log enrollments, removals, and election status changes
    event ProfessorEnrolled(address indexed professor, address indexed university, uint256 totalProfessors, uint256 feePaid);
    event ProfessorRemoved(address indexed professor, address indexed university, uint256 totalProfessors, uint256 feeRefunded);
    event VoteStatusChanged(VoteStatus newStatus);
    event ElectionStarted(address indexed university, uint256 electionEndBlock);
    event FeeReceived(address indexed professor, address indexed university, uint256 fee);

    // Add a state variable to track the number of universities that voted
    uint256 public votedUniversitiesCount;

    // Constructor to set default values for universityCount, electionDuration, and election status
    constructor() {
        universityCount = 100;  // Default number of universities
        electionDurationInBlocks = 10000;  // Default election duration in blocks
        VOTE_STATUS = VoteStatus.NO_ELECTION;  // Initial election status is "no election"
        votedUniversitiesCount = 0;  // Initially, no universities have voted
    }

    // Modifier to ensure actions are only allowed when there is no election
    modifier onlyWhenNoElection() {
        require(VOTE_STATUS == VoteStatus.NO_ELECTION, "Action not allowed during election.");
        _;
    }

    // Modifier to ensure actions are only allowed during an ongoing election
    modifier onlyDuringElection() {
        require(VOTE_STATUS == VoteStatus.IN_PROGRESS, "Election is not in progress.");
        _;
    }

    // Modifier to restrict access to only the university that started the election
    modifier onlyUniversity() {
        require(msg.sender == universityAddress, "Only the university can call this function.");
        _;
    }

    // Function to enroll the professor (sender) in a university and pay the enrollment fee
    function enrollProfessor(address university) external payable onlyWhenNoElection {
        address professor = msg.sender; // Use the msg.sender as the professor address
        require(professor != address(0), "Professor address cannot be zero.");
        require(university != address(0), "University address cannot be zero.");
        require(professorToUniversity[professor] == address(0), "Professor is already enrolled in a university.");
        require(universityProfessors[university] < CAP, "University has reached the maximum capacity of professors.");
        require(msg.value == ENROLLMENT_FEE, "Incorrect enrollment fee.");

        // Log the received fee
        emit FeeReceived(professor, university, msg.value); // Log the fee sent with the transaction

        // Assign the professor to the university
        professorToUniversity[professor] = university;

        // Increment the count of professors in the university
        universityProfessors[university] += 1;

        // Transfer the fee to the university
        payable(university).transfer(msg.value);

        // Emit an event for the enrollment
        emit ProfessorEnrolled(professor, university, universityProfessors[university], msg.value);
    }

    // Function to remove a professor from their university and refund the enrollment fee
    function removeProfessor() external onlyWhenNoElection {
        address professor = msg.sender; // Use the msg.sender as the professor address
        address university = professorToUniversity[professor];
        require(university != address(0), "Professor is not enrolled in any university.");

        // Remove the professor from the university
        professorToUniversity[professor] = address(0);

        // Decrement the count of professors in the university
        universityProfessors[university] -= 1;

        // Refund the enrollment fee to the professor
        payable(professor).transfer(ENROLLMENT_FEE);

        // Emit an event for the removal
        emit ProfessorRemoved(professor, university, universityProfessors[university], ENROLLMENT_FEE);
    }

    // Function to start the election (called by the university)
    function startVotation() external payable onlyWhenNoElection {
        require(msg.value == ELECTION_START_FEE, "Incorrect election start fee.");
        
        // Change the election status to IN_PROGRESS
        VOTE_STATUS = VoteStatus.IN_PROGRESS;

        // Set the election end block based on the current block number and election duration in blocks
        electionEndBlock = block.number + electionDurationInBlocks;

        // Emit event for election start
        emit ElectionStarted(msg.sender, electionEndBlock);
        
        // Emit an event for the status change
        emit VoteStatusChanged(VOTE_STATUS);

        // Set the university that started the election
        universityAddress = msg.sender;

        // Add the university to the universities array
        universities.push(msg.sender);
    }

    // Function to vote by university (only during election)
    function vote() external onlyDuringElection {
        address university = msg.sender;
        
        require(!universitiesVoted[university], "University has already voted.");
        
        // Mark the university as having voted
        universitiesVoted[university] = true;
        
        // Increment the count of universities that have voted
        votedUniversitiesCount++;

        // Emit event when university votes
        emit UniversityVoted(university);

        // Check if the election should end
        checkElectionStatus();
    }

    // Function to check if the election is over by either reaching the CAP or deadline
    function checkElectionStatus() public {
        // Use the new votedUniversitiesCount variable
        if (votedUniversitiesCount >= universityCount || block.number >= electionEndBlock) {
            VOTE_STATUS = VoteStatus.CLOSED;

            // If quorum is not reached, refund the fee to the university that started the election
            if (votedUniversitiesCount < universityCount / 2) {  // Quorum is set to half of the universities
                payable(universityAddress).transfer(ELECTION_START_FEE); // Refund the fee
            }

            emit VoteStatusChanged(VOTE_STATUS); // Emit event when election is closed
        }
    }

    // Function to get the number of universities that voted
    function getVoteCount() external view returns (uint256) {
        return votedUniversitiesCount;
    }

    // Function to get the number of professors in a university
    function getNumberOfProfessors(address university) external view returns (uint256) {
        return universityProfessors[university];
    }

    // Function to get the university a professor is enrolled in
    function getUniversityOfProfessor(address professor) external view returns (address) {
        return professorToUniversity[professor];
    }

    // Function to get the current election status
    function getVoteStatus() external view returns (VoteStatus) {
        return VOTE_STATUS;
    }

    // Function to get the election duration in blocks
    function getElectionDurationInBlocks() external view returns (uint256) {
        return electionDurationInBlocks;
    }

    // Function to get the block number when the election ends
    function getElectionEndBlock() external view returns (uint256) {
        return electionEndBlock;
    }
}

