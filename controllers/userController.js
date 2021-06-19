exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tours: tours,
    },
  });
};

exports.getUser = (req, res) => {
  const tourId = req.params.id;
  const tour = tours.find((tour) => tour.id === tourId);

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.createUser = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return console.log(err);
      }
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};
