1.strict validation required for all routes

2.Error Handling Mechanism for services Handling Null cases what if documents dosent receive what if id is wrong

3 . Validate ObjectId before querying

4 . Imporve DTOS(both create and update) and check the dbobject id before reaching actual function

5.Path verificatiom make sure follow one type.

<!-- Take Care about pipes using class validator and transfomer -->
1.install both packages
2.i am using the validation pipe intialise globally in main.ts file
3.goto DTO add validations like @IsNotEmpty like that

<!-- Setting up the autorization using passport js-->
npm install --save @nestjs/passport passport passport-local
npm install --save-dev @types/passport-local
<!-- intialise the auth module -->
nest g module auth
add controller to it
nest g controller auth --no-spec
nest g service auth --no-spec

<!-- Create schema -->
<!-- HeadOver to auth Module and intilise monggoseModule.forFeature([{name:className , schema: schemaname}]) -->
<!-- after updating that we are doing auth through passport so import passport in main.ts imports array and set the defaultStrategy for register -->

<!-- install jwt module npm install @nestjs/jwt and import it in imports module AND SETUP IT-->

<!-- write the signup and login functinoality -->

<!-- implement the jwt startegy by extending pasport stargey acces the jwttoken from payload and validate it and return the user id -->

<!-- export the auth module to use in other book module import it book module use authguards(passportauth gards) -->

<!-- test the endppoints make post as authorized -->

<!-- now change the book schema add user because those who created by providing user:User type is mongoose.Schema.Types.ObjectId -->

<!-- in contoller collect the userid from @req() req  req.user for @post send it to service accept there any assign to the obj before storing. while assigning the user_id i got error so in that we import the document in schema-->

<!-- role based  -->
1. create a enum folder in auth module create role enum 
2. attach enum to the metdata just have to set our role with these set metadata and then we can acess this metadata which is roles with our reflactor helper class. so to do this process create decorators folder in auth;
3. Now we have to create our guard which we simply implement canActive interface and we override it use reflactor class to get meta data.
4. Go to schema and add role:Role[] define the constraints.
5. go book controller and protectusing @Roles update this  @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard() , RolesGuard)

6. if we test these endpoint it dosent work because you need to send the role to db to store we need to modfiy the auth service.ts and add role to signUpDTO and send to db


<!-- File Uploads -->
1.create the put route add auth gaurds.
2.implement the Interceptors



<!-- soft delete  -->


<!-- frontend -->
1. signup , login
2. retrive the data from backend and render it in frontend













<!-- Todo -->

1. Test all endpoints basic test -ok -----test case tests

2. (Borrow Module):
    2.0 --> Schema , DTO's flow validations
    2.1 --> Due Date Generation  can Generate in frontend
    2.2 -->soft delete 
    2.3 --> returning book ---add soft del url
    2.4--> Add Roleguards AuthGuards Helmet Rate limit
    2.5 --> validate the error handling mechanism

3. setup frontend(for login / logout routes)