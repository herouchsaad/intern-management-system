import { Spin } from "antd"
import { relative } from "path";

const LoadingContainer = () => {

    return(
        <div>
        <div className="loading-container">
            <Spin size="large">
                <div className="loadin-cirle" />
            </Spin>
        </div>
        </div>
        
    )
}

export default LoadingContainer;