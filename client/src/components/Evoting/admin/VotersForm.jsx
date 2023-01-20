import {useEth} from "../../../contexts/EthContext";
import {useEffect, useState} from "react";
import Alert from "../Alert";

export default function VotersForm() {

    const { state: { contract, accounts } } = useEth();
    const [state, setState] = useState({
        voters: [],
        voterAddress: '',
        isError: false,
        errorMessage: '',
    });

    useEffect(() => {
        getVoters().then(r => {
            if (!r) return;
            setState(prevState => ({
                ...prevState,
                voters: r
            }));
        });
    }, [contract]);

    const getVoters = async () => {
        try {
            if (contract) {
                return await contract.methods.getListVoters().call()
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleChange = function (e) {
        setState(prevState => ({
            ...prevState,
            voterAddress: e.target.value
        }));
    }

    function extractJSON(str) {
        var firstOpen, firstClose, candidate;
        firstOpen = str.indexOf('{', firstOpen + 1);
        do {
            firstClose = str.lastIndexOf('}');
            console.log('firstOpen: ' + firstOpen, 'firstClose: ' + firstClose);
            if(firstClose <= firstOpen) {
                return null;
            }
            do {
                candidate = str.substring(firstOpen, firstClose + 1);
                console.log('candidate: ' + candidate);
                try {
                    var res = JSON.parse(candidate);
                    console.log('...found');
                    return [res, firstOpen, firstClose + 1];
                }
                catch(e) {
                    console.log('...failed');
                }
                firstClose = str.substr(0, firstClose).lastIndexOf('}');
            } while(firstClose > firstOpen);
            firstOpen = str.indexOf('{', firstOpen + 1);
        } while(firstOpen != -1);
    }

    const addVoter = async (e) => {
        e.preventDefault();
        try {
            if (contract) {
                await contract.methods.addVoters(state.voterAddress).send({ from: accounts[0] });
                getVoters().then(r => {
                    if (!r) return;
                    setState(prevState => ({
                        ...prevState,
                        voters: r,
                        voterAddress: ''
                    }));
                });
            }
        } catch (e) {
            const extractJson = extractJSON(e.message)
            const errorMessage = extractJson ? extractJson[0].value.data.message : e.message;
            setState(prevState => ({
                ...prevState,
                isError: true,
                errorMessage: errorMessage
            }));
        }
    };

    return (
        <>
            <div className="mb-3">
                <form>
                    <div className="flex flex-wrap -mx-3">
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                   htmlFor="grid-password">
                                Input Voters
                            </label>
                            <div className="mb-6 mt-2">
                                <Alert isError={state.isError} errorMessage={state.errorMessage} />
                            </div>
                            <div className="flex flex-nowrap">
                                <div className="w-full">
                                    <input
                                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        id="grid-password" type="text" placeholder="Input Voter..." onChange={handleChange} value={state.voterAddress} />
                                </div>
                                <div className="ml-3">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 mb-3 rounded" onClick={addVoter}>
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div className="bg-white">
                <table className="table-auto border-collapse border border-slate-400 w-full">
                    <thead>
                    <tr>
                        <th className="border border-slate-300 bg-gray-100">Voters Address</th>
                    </tr>
                    </thead>
                    <tbody>
                    {state.voters && state.voters.map((voter, index) => (
                        <tr key={index}>
                            <td className="border border-slate-300">{voter.voterAddress}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}