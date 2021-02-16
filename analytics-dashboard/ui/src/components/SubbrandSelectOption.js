import React,{ Component } from 'react';
import { Select } from 'antd';
import * as CustomerUtil from '../util/CustomerUtil';
import PropTypes from 'prop-types';

const { Option } = Select;

export default class SubbrandSelectOption extends Component {
    static propTypes = {
        updateSelectedCustomer: PropTypes.func.isRequired,
        options:PropTypes.array.isRequired,
        currentSelection:PropTypes.string.isRequired
    }

    onChange = (value) =>{
    //console.log(`Customer Selected: ${value}`);
        this.props.updateSelectedCustomer(value);
    }

    render() {
    //console.log("Rendering <CustomerSelector> component");
        return(
        <Select
            showSearch
            style={{ width: '200px' }}
            defaultValue={CustomerUtil.getCustomerById(this.props.currentSelection, this.props.options).name}
            optionFilterProp="children"
            onChange={this.onChange}
            onSearch={this.onSearch}
            filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            {
               this.props.options.map((option, index) => {
                return <Option key={index} value={option.id}>{option.name}</Option>
              })
            }   
        </Select>
        )
    }
}