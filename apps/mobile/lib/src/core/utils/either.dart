sealed class Either<L, R> {
  const Either();

  T fold<T>(T Function(L left) onLeft, T Function(R right) onRight);
}

final class Left<L, R> extends Either<L, R> {
  const Left(this.value);

  final L value;

  @override
  T fold<T>(T Function(L left) onLeft, T Function(R right) onRight) =>
      onLeft(value);
}

final class Right<L, R> extends Either<L, R> {
  const Right(this.value);

  final R value;

  @override
  T fold<T>(T Function(L left) onLeft, T Function(R right) onRight) =>
      onRight(value);
}
