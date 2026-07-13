import { Spin } from "antd"

const Loading = () => {

    return(
        <div>
        <div style={{marginTop: "25%"}}>
            <Spin tip="Loading" size="large">
                <div className="content" />
            </Spin>
        </div>
        </div>
        
    )
}

export default Loading;