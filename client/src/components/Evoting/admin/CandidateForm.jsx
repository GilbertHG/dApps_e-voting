import {useEth} from "../../../contexts/EthContext";
import {useEffect, useState} from "react";
import Alert from "../Alert";

export default function CandidateForm() {

    const { state: { contract, accounts } } = useEth();
    const [state, setState] = useState({
        candidates: [],
        candidateName: ''
    });

    useEffect(() => {
        getCurrentVotes().then(r => {
            if (!r) return;
            setState(prevState => ({
                ...prevState,
                candidates: r
            }));
        });
    }, [contract]);

    const getCurrentVotes = async () => {
        try {
            if (contract) {
                return await contract.methods.currentVotes().call()
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleChange = function (e) {
        setState(prevState => ({
            ...prevState,
            candidateName: e.target.value
        }))
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

    const addCandidate = async (e) => {
        e.preventDefault();
        try {
            if (contract) {
                console.log(accounts[0])
                await contract.methods.addCandidate(state.candidateName).send({ from: accounts[0] });
                getCurrentVotes().then(r => {
                    if (!r) return;
                    setState(prevState => ({
                        ...prevState,
                        candidates: r,
                        candidateName: ''
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
                                Input Candidate
                            </label>
                            <div className="mb-6 mt-2">
                                <Alert/>
                            </div>
                            <div className="flex flex-nowrap">
                                <div className="w-full">
                                    <input
                                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        id="grid-password" type="text" placeholder="Input Candidate..." onChange={handleChange} value={state.candidateName} />
                                </div>
                                <div className="ml-3">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 mb-3 rounded" onClick={addCandidate}>
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
                        <th className="border border-slate-300 bg-gray-100">Candidates Name</th>
                        <th className="border border-slate-300 bg-gray-100">Total Votes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {state.candidates && state.candidates.map((candidate, index) => (
                        <tr key={index}>
                            <td className="border border-slate-300">{candidate.name}</td>
                            <td className="border border-slate-300">{candidate.voteCount}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}