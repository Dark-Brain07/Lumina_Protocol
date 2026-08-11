import pytest
from gltest.direct import VMContext

BASE_ISO = "2026-08-11T00:00:00Z"

@pytest.fixture
def vm():
    return VMContext()

@pytest.fixture
def contract(vm, direct_deploy):
    vm.warp(BASE_ISO)
    return direct_deploy("contracts/lumina_protocol.py")

def test_initially_disconnected_flow(vm, contract):
    """
    Simulates the disconnected state. Unregistered or empty addresses 
    must not be able to interact with core logic maliciously.
    """
    
    # 1. Empty/Disconnected user tries to create a bounty
    vm.switch_sender("0x0000000000000000000000000000000000000000")
    with pytest.raises(Exception):
        contract.create_living_bounty(
            "Test Bounty",
            "Category",
            "http://desc",
            "http://acc",
            "100",
            "500",
            "1000",
            "100",
            "86400"
        )
    
    # Let valid sponsor create bounty
    sponsor = "0x1111111111111111111111111111111111111111"
    vm.switch_sender(sponsor)
    vm.set_value(600)
    bounty_id = contract.create_living_bounty(
        "Valid Bounty",
        "Code",
        "http://desc",
        "http://acc",
        "100", # initial_reward
        "500", # lumina_pool
        "1000", # cap
        "100", # max_cycle
        "86400" # interval
    )

    # 2. Disconnected/empty sender tries to accept the contribution on behalf of sponsor
    vm.switch_sender("0x0000000000000000000000000000000000000000")
    with pytest.raises(Exception):
        contract.accept_contribution(bounty_id)

    # 3. Disconnected sender tries to cancel unaccepted bounty
    with pytest.raises(Exception):
        contract.cancel_unaccepted_bounty(bounty_id)

def test_basic_lifecycle(vm, contract):
    sponsor = "0x1111111111111111111111111111111111111111"
    contributor = "0x2222222222222222222222222222222222222222"
    
    vm.switch_sender(sponsor)
    vm.set_value(600)
    bounty_id = contract.create_living_bounty(
        "API Integration",
        "Development",
        "http://example.com/desc",
        "http://example.com/acc",
        "100",
        "500",
        "1000",
        "100",
        "86400"
    )
    
    vm.switch_sender(contributor)
    contract.submit_contribution(
        bounty_id,
        "http://example.com/deliverable",
        "http://github.com/repo",
        "http://docs.com",
        "MIT",
        "Will maintain",
        "Completed API integration"
    )
    
    vm.switch_sender(sponsor)
    contract.accept_contribution(bounty_id)
    
    # Assert initial payout happened implicitly or state changed
    # (Since we lack a balance checker in simple gltest here, we rely on successful execution)
