import { useNavigate } from "react-router-dom"

const Unauthorized = () => {

    const navigate = useNavigate();

    const goBack = () =>{
        navigate(-1);
    }

    return(
        <>
        <h2>You are unauthorized.</h2>
        <button onClick={goBack}>Go Back</button>
        </>
    )

}

export default Unauthorized;