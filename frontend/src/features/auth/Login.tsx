import {
useForm
} from "react-hook-form";


export default function Login(){


const {
register,
handleSubmit
}=useForm();


function submit(data:any){

console.log(data);

}


return (

<div className="max-w-md mx-auto mt-20">


<h1 className="text-3xl font-bold mb-5"> Login </h1>


<form
onSubmit={handleSubmit(submit)}
className="space-y-4"
>


<input
className="border p-3 w-full"
placeholder="Email"
{...register("email")}
/>


<input

className="border p-3 w-full"

type="password"

placeholder="Password"

{...register("password")}

/>


<button

className="bg-black text-white px-5 py-3 rounded"

>

Login

</button>


</form>


</div>

)

}
